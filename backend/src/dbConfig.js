const dbConfig = {
  // removed DB config as we dont actually use the DB here
    host: 'x',
    user: 'x',
    password: 'x', // Replace this with your actual password
    database: 'x', // Replace this with your actual database name
    port: 3306, // Default port for MariaDB is 3306, but update if needed
    ssl: {
      // If SSL is used but with disabled verification, as indicated in your server information
      rejectUnauthorized: false,
    },
  };
  
  module.exports = dbConfig;