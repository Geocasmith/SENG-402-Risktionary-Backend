import http from 'http';
import https from 'https';
import fs from 'fs';
import express from 'express';
import { NodeEnvs } from '@src/constants/misc';

export function createHttpServer(app: express.Application) {
  if (process.env.NODE_ENV === NodeEnvs.Dev) {
    const privateKey = fs.readFileSync('/etc/letsencrypt/live/csse-risk1.canterbury.ac.nz/privkey.pem', 'utf8');
    const certificate = fs.readFileSync('/etc/letsencrypt/live/csse-risk1.canterbury.ac.nz/fullchain.pem', 'utf8');
    
    const credentials = {
      key: privateKey,
      cert: certificate,
    };

    return https.createServer(credentials, app);
  } else {
    return http.createServer(app);
  }
}
