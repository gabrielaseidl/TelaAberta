const ErroHttp = require('../utils/ErroHttp');

// Responde 404 para rotas /api que não existem
function rotaNaoEncontrada(req, res) {
  res.status(404).json({ erro: 'Rota não encontrada' });
}

// Middleware de erro: o Express o reconhece por ter 4 parâmetros
function tratarErros(err, req, res, next) {
  // Erros previstos, lançados pelos controllers (400, 401, 403, 404, 409...)
  if (err instanceof ErroHttp) {
    const corpo = { erro: err.message };
    if (err.detalhes) corpo.detalhes = err.detalhes;
    return res.status(err.status).json(corpo);
  }

  // JSON malformado no corpo da requisição
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição' });
  }

  // Qualquer outro erro é inesperado: registra no terminal e devolve 500
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
}

module.exports = { rotaNaoEncontrada, tratarErros };