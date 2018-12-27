import express from 'express';
import ReactDOMServer from 'react-dom/server';
import { AppRegistry } from 'react-native';
import React from 'react';
import startServer from './startServer';
import startSocketServer from './startSocketServer';
import { IS_DEV } from './config';
import NavigationContext from '../navigation-core/views/NavigationContext';
import handleServerRequest from '../navigation-web/handleServerRequest';
import Buffer from '../buffer';
const yes = require('yes-https');
const helmet = require('helmet');
const http = require('http');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const path = require('path');
const mime = require('mime');

const isProd = process.env.NODE_ENV === 'production';

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);

const sendNotFound = res => {
  res.status(404);
  res.send('Not found');
};

async function blockResponse({
  domain,
  docName,
  dispatch,
  refPath,
  blockId,
  blockName,
}) {
  const block = await dispatch({
    type: 'GetBlock',
    domain,
    name: docName,
    id: blockId,
  });
  if (!block) {
    return sendNotFound;
  }
  if (refPath === '/' || refPath === '') {
    if (!block.value || !block.value.data) {
      // should be checking for some type here, rather than looking at "data"..
      return res => {
        res.send(block.value);
      };
    }
    const mimeType = mime.getType(path.extname(blockName));
    return res => {
      res.header('Content-Type', mimeType);
      res.send(Buffer.from(block.value.data, 'hex'));
    };
  }
  if (!block.value || !block.value.files) {
    return sendNotFound;
  }
  const pathParts = refPath.split('/');
  const pathTermName = pathParts[1];
  if (block.value.files[pathTermName]) {
    const childRefPath = `/${pathParts.slice(2).join('/')}`;
    const childId = block.value.files[pathTermName].id;
    return await blockResponse({
      domain,
      docName,
      dispatch,
      blockName: pathTermName,
      blockId: childId,
      refPath: childRefPath,
    });
  }
  return sendNotFound;
}

async function webDataInterface({ domain, docName, dispatch, refPath }) {
  const ref = await dispatch({
    type: 'GetDoc',
    domain,
    name: docName,
  });
  if (!ref || !ref.id) {
    return sendNotFound;
  }
  return await blockResponse({
    domain,
    docName,
    dispatch,
    blockName: docName,
    blockId: ref.id,
    refPath,
  });
}

export default async function WebServer({
  App,
  dataSource,
  context,
  serverListenLocation,
  extraneousExpressRouting,
}) {
  const expressApp = express();
  const jsonParser = bodyParser.json();
  expressApp.use(jsonParser); // hmm.. we should probably parse json less aggressively..
  process.env.ENFORCE_HTTPS && expressApp.use(yes());
  expressApp.use(helmet());
  expressApp.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
  });

  AppRegistry.registerComponent('App', () => {
    function AppWithContext(props) {
      let el = <App {...props} />;
      context.forEach((value, C) => {
        el = <C.Provider value={value}>{el}</C.Provider>;
      });
      el = (
        <NavigationContext.Provider value={props.navigation}>
          {el}
        </NavigationContext.Provider>
      );
      return el;
    }

    return AppWithContext;
  });

  // const publicDir = isProd ? 'build/public' : `src/${activeApp}/public`;
  const publicDir = isProd ? 'build/public' : `public`;

  expressApp.disable('x-powered-by');
  expressApp.use(express.static(publicDir));
  expressApp.post('/dispatch', (req, res) => {
    dataSource
      .dispatch(req.body)
      .then(result => {
        if (result === undefined) {
          return res.send({});
        }
        res.send(result);
      })
      .catch(err => {
        console.error(err);
        res.status(500).send(String(err));
      });
  });

  extraneousExpressRouting && extraneousExpressRouting(expressApp);

  expressApp.get('/_/:domain/:ref*', (req, res) => {
    const docName = req.params.ref;
    const domain = req.params.domain;
    const refPath = req.params['0'];

    webDataInterface({
      domain,
      docName,
      refPath,
      dispatch: dataSource.dispatch,
    })
      .then(responder => {
        responder(res);
      })
      .catch(e => {
        res.status(500);
        console.error(e);
        res.send(e);
      });
  });

  expressApp.get('/*', (req, res) => {
    const { path, query } = req;

    let navigation = {};
    let title = '';
    let options = {};
    if (App.router) {
      const response = handleServerRequest(App.router, path, query);
      navigation = response.navigation;
      title = response.title;
      options = response.options;
    }

    const { element, getStyleElement } = AppRegistry.getApplication('App', {
      initialProps: {
        navigation,
        env: 'server',
      },
    });

    const html = ReactDOMServer.renderToString(element);
    const css = ReactDOMServer.renderToStaticMarkup(getStyleElement());

    res.send(
      `<!doctype html>
    <html lang="">
    <head>
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta charSet='utf-8' />
        <title>${title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style id="root-stylesheet">
        html, body, #root {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        ${options.customCSS}
        </style>
        ${css}
        ${
          isProd
            ? `<script src="${assets.client.js}" defer></script>`
            : `<script src="${assets.client.js}" defer crossorigin></script>`
        }
    </head>
    <body>
        <div id="root">${html}</div>
        ${options.customHTML || ''}
    </body>
</html>`
    );
  });

  const httpServer = http.createServer(expressApp);

  const wss = new WebSocket.Server({ server: httpServer });

  await startServer(httpServer, serverListenLocation);

  const wsServer = await startSocketServer(wss, dataSource);

  console.log('Listening on ' + serverListenLocation);
  IS_DEV && console.log(`http://localhost:${serverListenLocation}`);

  return {
    close: async () => {
      httpServer.close();
      wsServer && wsServer.close();
    },
  };
}
