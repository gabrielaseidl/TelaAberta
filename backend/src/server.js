require('dotenv').config();   // precisa ser a PRIMEIRA linha

const app = require('./app');

const PORTA = process.env.PORT || 3000;

app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});