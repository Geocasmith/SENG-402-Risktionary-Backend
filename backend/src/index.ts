import './pre-start'; // Must be the first import
import logger from 'jet-logger';

import EnvVars from '@src/constants/EnvVars';
import httpServer from './server';

if (process.env.NODE_ENV === 'production') {
  require('module-alias/register');
}
// **** Run **** //

const SERVER_START_MSG = ('Express server started on port: ' + 
  EnvVars.Port.toString());
  
// const { pool: dbPool, testConnection,createUsersTable } = require('./dbConnection');

// server.listen(EnvVars.Port, () => logger.info(SERVER_START_MSG));
httpServer.listen(EnvVars.Port, () => logger.info(SERVER_START_MSG));
