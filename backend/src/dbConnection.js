const mariadb = require('mariadb');
const dbConfig = require('./dbconfig');

const pool = mariadb.createPool(dbConfig);

async function testConnection() {
    try {
      const connection = await pool.getConnection();
      console.log('Connected to the MariaDB database as ID:', connection.threadId);
      connection.release();
    } catch (error) {
      console.error('Error connecting to the MariaDB database:', error.stack);
    }
  }
  
  async function createUsersTable() {
    try {
      const sql = `
        CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
  
      await pool.query(sql);
      console.log('Users table created successfully');
    } catch (error) {
      console.error('Error creating users table:', error.stack);
    }
  }
  module.exports = {
    pool,
    createUsersTable,
    testConnection,
  };
