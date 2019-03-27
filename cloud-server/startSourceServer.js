import express from 'express';
import startServer from './startServer';
import startSocketServer from './startSourceSocketServer';
const http = require('http');
const bodyParser = require('body-parser');
const WebSocket = require('ws');

const IS_DEV = process.env.NODE_ENV !== 'production';

export default async function startSourceServer({
  source,
  listenLocation,
  expressRouting = undefined,
  fallbackExpressRouting = undefined,
  quiet = false,
}) {
  const expressApp = express();
  const jsonParser = bodyParser.json();

  expressRouting && expressRouting(expressApp);

  expressApp.post('/dispatch', jsonParser, (req, res) => {
    source
      .dispatch(req.body)
      .then(result => {
        if (result === undefined) {
          return res.send({});
        }
        res.send(result);
      })
      .catch(err => {
        !quiet && console.error(err);
        res.status(500).send(
          JSON.stringify({
            message: String(err),
            type: err.type,
            detail: err.detail,
          })
        );
      });
  });

  fallbackExpressRouting && fallbackExpressRouting(expressApp);

  const httpServer = http.createServer(expressApp);

  const wss = new WebSocket.Server({ server: httpServer });

  await startServer(httpServer, listenLocation);

  const wsServer = await startSocketServer(wss, source);

  !quiet && console.log('Listening on ' + listenLocation);
  !quiet && IS_DEV && console.log(`http://localhost:${listenLocation}`);

  return {
    close: async () => {
      httpServer.close();
      wsServer && wsServer.close();
    },
  };
}
