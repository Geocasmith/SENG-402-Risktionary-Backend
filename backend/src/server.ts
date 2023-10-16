/**
 * Setup express server.
 */
import { Server } from 'socket.io';
import { createServer } from 'http';
import { setupDrawingSocket } from './sockets/socket';
import { setupChatSocket } from "./sockets/chatSocket";

import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';
import express, { Request, Response, NextFunction } from 'express';
import logger from 'jet-logger';
import { createHttpServer } from './httpServerConfig';

import 'express-async-errors';

import BaseRouter from '@src/routes/api';
import Paths from '@src/routes/constants/Paths';

import EnvVars from '@src/constants/EnvVars';
import HttpStatusCodes from '@src/constants/HttpStatusCodes';

import { NodeEnvs } from '@src/constants/misc';
import { RouteError } from '@src/other/classes';

// Import required modules for HTTPS
// import fs from 'fs';
// import https from 'https';

// // Load SSL certificate and key
// const privateKey = fs.readFileSync('/etc/letsencrypt/live/csse-risk1.canterbury.ac.nz/privkey.pem', 'utf8');
// const certificate = fs.readFileSync('/etc/letsencrypt/live/csse-risk1.canterbury.ac.nz/fullchain.pem', 'utf8');
// // If you have a CA Bundle, uncomment the following line and update the path
// // const ca = fs.readFileSync('path/to/ca_bundle.crt', 'utf8');

// const credentials = {
//   key: privateKey,
//   cert: certificate,
//   // Uncomment the following line if you have a CA Bundle
//   // ca: ca,
// };

// **** Variables **** //

const app = express();

const server = createHttpServer(app);

//socket server
// const server = https.createServer(credentials, app); // Updated to use HTTPS
// const server = http.createServer(app); old http for local

const io = new Server(server, {
  cors: {
    origin: '*', // You can replace '*' with your frontend app's URL for security
    methods: ['GET', 'POST']
  }
});

setupDrawingSocket(io);
setupChatSocket(io);

const PORT =  3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



const dbPool = require('./dbConnection');
const cors = require('cors');


// Example route to query the database
app.get('/example', async (req, res) => {
  try {
    const query = 'SELECT * FROM your_table_name'; // Replace with a valid SQL query for your database
    const results = await dbPool.query(query);
    res.json(results);
  } catch (error) {
    console.error('Error executing query:', error.stack);
    res.status(500).json({ error: 'An error occurred while processing the request.' });
  }
});

// **** Setup **** //
//setup cors
app.use(cors());

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser(EnvVars.CookieProps.Secret));

// Show routes called in console during development
if (EnvVars.NodeEnv === NodeEnvs.Dev) {
  app.use(morgan('dev'));
}

// Security
if (EnvVars.NodeEnv === NodeEnvs.Production) {
  app.use(helmet());
}

// Add APIs, must be after middleware
app.use(Paths.Base, BaseRouter);

// Add error handler
app.use((
  err: Error,
  _: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  if (EnvVars.NodeEnv !== NodeEnvs.Test) {
    logger.err(err, true);
  }
  let status = HttpStatusCodes.BAD_REQUEST;
  if (err instanceof RouteError) {
    status = err.status;
  }
  return res.status(status).json({ error: err.message });
});


// ** Front-End Content ** //

// Set views directory (html)
const viewsDir = path.join(__dirname, 'views');
app.set('views', viewsDir);

// Set static directory (js and css).
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));

// Nav to login pg by default
app.get('/', (_: Request, res: Response) => {
  res.sendFile('login.html', { root: viewsDir });
});

// Redirect to login if not logged in.
app.get('/users', (req: Request, res: Response) => {
  const jwt = req.signedCookies[EnvVars.CookieProps.Key];
  if (!jwt) {
    res.redirect('/');
  } else {
    res.sendFile('users.html', {root: viewsDir});
  }
});



// **** Export default **** //

export default app;
