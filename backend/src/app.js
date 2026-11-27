const express = require('express');
const path = require('path');
const pool = require('./db');
const { rotaNaoEncontrada, tratarErros } = require('./middlewares/erros');

const app = express();

app.use(express.json());

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

// Frontend estático
const pastaFrontend = path.join(__dirname, '..', '..', 'frontend');
app.use(express.static(pastaFrontend));

// 404 para rotas /api inexistentes
app.use('/api', rotaNaoEncontrada);

// Tratamento de erros: SEMPRE o último
app.use(tratarErros);

module.exports = app;