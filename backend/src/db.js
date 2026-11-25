const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERRO: variável DATABASE_URL não definida. Verifique o arquivo .env');
}

// Pool = conjunto de conexões reaproveitadas entre as requisições
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

module.exports = pool;