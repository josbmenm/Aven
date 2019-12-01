import express from 'express';
import startServer from './startServer';
import attachSourceSocketServer from './attachSourceSocketServer';
import { log, trace, error } from '../logger/logger';
const http = require('http');
const bodyParser = require('body-parser');
const WebSocket = require('ws');

const IS_DEV = process.env.NODE_ENV !== 'production';

export default async function attachSourceServer({
  httpServer,
  source,
  listenLocation,
  expressRouting = undefined,
  fallbackExpressRouting = undefined,
  augmentRequestDispatchAction = undefined,
}) {
  const expressApp = express();
  const jsonParser = bodyParser.json({ limit: '11mb' });

  expressRouting && expressRouting(expressApp);

  expressApp.post(
    '/dispatch',
    (req, res, next) => {
      if (req.socket.bytesRead > 1e7) {
        error('LargeJSON', {
          limit: 1e7,
          bytes: req.socket.bytesRead,
        });
      }
      next();
    },
    jsonParser,
    (req, res) => {
      let actionToDispatch = req.body;
      if (augmentRequestDispatchAction) {
        actionToDispatch = augmentRequestDispatchAction(req, actionToDispatch);
      }
      trace('SourceDispatchStart', { action: actionToDispatch });
      source
        .dispatch(actionToDispatch)
        .then(result => {
          if (result === undefined) {
            return res.send({});
          }
          res.send(result);
        })
        .catch(err => {
          const errorData = {
            message: String(err),
            name: err.name,
            detail: err.detail,
          };
          error('SourceDispatchError', {
            action: actionToDispatch,
            error: errorData,
          });
          res.status(500).send(JSON.stringify(errorData));
        });
    },
  );

  fallbackExpressRouting && fallbackExpressRouting(expressApp);

  let outputServer = httpServer;
  if (outputServer) {
    outputServer.on('request', expressApp);
    console.log('attaching to existing http server..');
  } else {
    const freshHttpServer = http.createServer(expressApp);
    outputServer = freshHttpServer;
    await startServer(freshHttpServer, listenLocation);

    log('ServerStarted', { listenLocation, host: process.env.HOST });
    IS_DEV && console.log(`http://localhost:${listenLocation}`);
  }

  const wss = new WebSocket.Server({ server: outputServer });

  const wsServer = await attachSourceSocketServer(wss, source);

  return {
    httpServer: outputServer,
    close: async () => {
      // warning.. actual http server must be closed independently! this is because of HMR behavior on the server
      outputServer.removeListener('request', expressApp);

      wsServer && wsServer.close();
    },
  };
}
