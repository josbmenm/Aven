import express from 'express';
import ReactDOMServer from 'react-dom/server';
import { AppRegistry } from 'react-native';

import { handleServerRequest } from '../react-navigation-web';

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);

export default async function AvenServer(App) {
  const server = express();

  AppRegistry.registerComponent('App', () => App);

  server.disable('x-powered-by');
  server.use(express.static(process.env.RAZZLE_PUBLIC_DIR));
  server.get('/*', (req, res) => {
    const { path, query } = req;

    const { navigation, title } = handleServerRequest(App.router, path, query);

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
        @font-face {
          src: url('/fonts/Ionicons.ttf');
          font-family: Ionicons;
        }
        @font-face {
          src: url('/fonts/FontAwesome.ttf');
          font-family: FontAwesome;
        }

        @font-face {
          src: url('/PTSansRegular.ttf');
          font-family: PTSans;
        }
        </style>
        ${css}
        ${
          process.env.NODE_ENV === 'production'
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

  let serverInstance = null;
  await new Promise((resolve, reject) => {
    serverInstance = server.listen(process.env.PORT, err => {
      if (err) reject(err);
      else resolve();
    });
  });

  return {
    close: async () => {
      serverInstance && serverInstance.close();
    },
  };
}
