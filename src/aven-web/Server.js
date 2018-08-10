import express from 'express';
import ReactDOMServer from 'react-dom/server';
import { AppRegistry } from 'react-native';
import startServer from './startServer';

import { handleServerRequest } from '../react-navigation-web';

const fs = require('fs-extra');
const http = require('http');

const pathJoin = require('path').join;

const activeApp = process.env.GLOBE_APP;

const isProd = process.env.NODE_ENV === 'production';

if (!activeApp && !isProd) {
  throw 'GLOBE_APP env var is missing';
}

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);

export default async function AvenServer(App) {
  const expressApp = express();

  AppRegistry.registerComponent('App', () => App);

  const publicDir = isProd ? 'build/public' : `src/${activeApp}/public`;

  expressApp.disable('x-powered-by');
  expressApp.use(express.static(publicDir));
  expressApp.get('/*', (req, res) => {
    const { path, query } = req;

    const { navigation, title, options } = handleServerRequest(
      App.router,
      path,
      query,
    );

    const { element, getStyleElement } = AppRegistry.getApplication('App', {
      initialProps: {
        navigation,
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
    </body>
</html>`,
    );
  });

  const serverListenLocation = process.env.GLOBE_LISTEN_SOCKET || 8888;
  const serverInstance = http.createServer(expressApp);
  await startServer(serverInstance, serverListenLocation);
  console.log('Listening on ' + serverListenLocation);

  return {
    close: async () => {
      serverInstance.close();
    },
  };
}
