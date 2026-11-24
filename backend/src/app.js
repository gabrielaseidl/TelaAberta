const express = require('express');
const path = require('path');

const app = express();

// Permite que o servidor entenda requisições com corpo em JSON
// (vamos usar no cadastro, login, criação de eventos...)
app.use(express.json());

// Rota de teste da API: confirma que o backend está no ar
app.get('/api/saude', (req, res) => {
  res.status(200).json({
    status: 'ok',
    mensagem: 'API do Tela Aberta funcionando'
  });
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