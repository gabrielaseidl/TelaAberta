const bcrypt = require('bcryptjs');
const pool = require('../db');
const ErroHttp = require('../utils/ErroHttp');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PERFIS_CADASTRO = ['usuario', 'organizador']; // admin NÃO pode se cadastrar

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

module.exports = { cadastrar };