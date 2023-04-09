const dbConfig = {
    host: 'db2.csse.canterbury.ac.nz',
    user: 'gca73',
    password: 'Hamilton7@1', // Replace this with your actual password
    database: 'gca73_402', // Replace this with your actual database name
    port: 3306, // Default port for MariaDB is 3306, but update if needed
    ssl: {
      // If SSL is used but with disabled verification, as indicated in your server information
      rejectUnauthorized: false,
    },
  };
  
  module.exports = dbConfig;