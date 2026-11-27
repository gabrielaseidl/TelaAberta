const bcrypt = require('bcryptjs');
const pool = require('../db');
const ErroHttp = require('../utils/ErroHttp');
const jwt = require('jsonwebtoken');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PERFIS_CADASTRO = ['usuario', 'organizador']; // admin NÃO pode se cadastrar

const DUAS_HORAS_MS = 2 * 60 * 60 * 1000;

const OPCOES_COOKIE = {
  httpOnly: true,                                  // JS da página não lê o cookie
  secure: process.env.NODE_ENV === 'production',   // só HTTPS no deploy
  sameSite: 'lax'
};

// POST /api/auth/cadastro
async function cadastrar(req, res) {
  // req.body chega undefined se a requisição vier sem corpo JSON
  const { nome, email, senha, perfil = 'usuario' } = req.body ?? {};

  // 1. Validação: junta todos os problemas para mostrar de uma vez
  const erros = [];
  if (typeof nome !== 'string' || nome.trim().length < 2 || nome.trim().length > 100) {
    erros.push('nome deve ter entre 2 e 100 caracteres');
  }
  if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    erros.push('email inválido');
  }
  if (typeof senha !== 'string' || senha.length < 8) {
    erros.push('senha deve ter pelo menos 8 caracteres');
  }
  if (!PERFIS_CADASTRO.includes(perfil)) {
    erros.push('perfil deve ser "usuario" ou "organizador"');
  }
  if (erros.length > 0) {
    throw new ErroHttp(400, 'Dados inválidos', erros);
  }

  // 2. Hash da senha
  const senhaHash = await bcrypt.hash(senha, 10);

  // 3. Grava no banco (consulta parametrizada: $1, $2...)
  try {
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, perfil)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nome, email, perfil, criado_em`,
      [nome.trim(), email.trim().toLowerCase(), senhaHash, perfil]
    );

    // 4. Responde 201 SEM o hash da senha
    res.status(201).json(rows[0]);
  } catch (erro) {
    // 23505 = código do PostgreSQL para violação de UNIQUE (email repetido)
    if (erro.code === '23505') {
      throw new ErroHttp(409, 'Este email já está cadastrado');
    }
    throw erro; // qualquer outro erro vira 500 no middleware
  }
}

// POST /api/auth/login
async function login(req, res) {
  const { email, senha } = req.body ?? {};

  if (typeof email !== 'string' || typeof senha !== 'string' || !email.trim() || !senha) {
    throw new ErroHttp(400, 'Informe email e senha');
  }

  const { rows } = await pool.query(
    'SELECT id, nome, email, senha_hash, perfil, ativo FROM usuarios WHERE email = $1',
    [email.trim().toLowerCase()]
  );
  const usuario = rows[0];

  // Compara a senha digitada com o hash gravado
  const senhaConfere = usuario && await bcrypt.compare(senha, usuario.senha_hash);

  // Mesma mensagem para "email não existe" e "senha errada"
  if (!senhaConfere) {
    throw new ErroHttp(401, 'Email ou senha incorretos');
  }
  if (!usuario.ativo) {
    throw new ErroHttp(403, 'Esta conta foi desativada');
  }

  // Cria o token assinado com a chave secreta
  const token = jwt.sign(
    { id: usuario.id, perfil: usuario.perfil },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  // Envia o token em um cookie httpOnly
  res.cookie('token', token, { ...OPCOES_COOKIE, maxAge: DUAS_HORAS_MS });

  res.status(200).json({
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil
  });
}

// POST /api/auth/logout
function logout(req, res) {
  res.clearCookie('token', OPCOES_COOKIE);   // manda o navegador apagar o cookie
  res.status(204).end();                     // 204 = sucesso, sem corpo
}

module.exports = { cadastrar, login, logout };