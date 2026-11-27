require('dotenv').config();   // precisa ser a PRIMEIRA linha

if (!process.env.JWT_SECRET) {
  console.error('ERRO: variável JWT_SECRET não definida no .env');
  process.exit(1);   // encerra: sem a chave, a autenticação não funciona
}

const app = require('./app');

const PORTA = process.env.PORT || 3000;

app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});