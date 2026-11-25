const express = require('express');
const path = require('path');

const pool = require('./db');

const app = express();

// Permite que o servidor entenda requisições com corpo em JSON
// (vamos usar no cadastro, login, criação de eventos...)
app.use(express.json());

// Rota de teste da API: confirma que o backend está no ar
// Rota de teste: confirma que a API e o banco estão funcionando
app.get('/api/saude', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT NOW() AS agora');
    res.status(200).json({
      status: 'ok',
      mensagem: 'API do Tela Aberta funcionando',
      banco: 'conectado',
      horario_banco: resultado.rows[0].agora
    });
  } catch (erro) {
    console.error('Erro ao conectar no banco:', erro.message);
    res.status(500).json({
      status: 'erro',
      mensagem: 'API no ar, mas sem conexão com o banco'
    });
  }
});

// Serve a pasta frontend como arquivos estáticos
// __dirname = pasta deste arquivo (backend/src); subimos dois níveis
const pastaFrontend = path.join(__dirname, '..', '..', 'frontend');
app.use(express.static(pastaFrontend));

// Qualquer rota /api que não exista responde 404 em JSON
app.use('/api', (req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

module.exports = app;