const { Client } = require('pg');

// Configuração do cliente PostgreSQL
const client = new Client({
  host: 'localhost', // Endereço do servidor PostgreSQL
  port: 5432,        // Porta padrão do PostgreSQL
  user: 'postgres',  // Usuário criado no PostgreSQL
  password: 'eduanea123', // Senha do usuário
  database: 'Estacionamento' // Banco usado
});

// Conectar ao banco
client.connect()
  .then(() => console.log('Conectado ao PostgreSQL!'))
  .catch(err => console.error('Erro ao conectar ao PostgreSQL:', err.stack));

module.exports = client;
