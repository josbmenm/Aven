import App from './App';

import express from 'express';
import ReactDOMServer from 'react-dom/server';
import { AppRegistry } from 'react-native';

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);

const server = express();

AppRegistry.registerComponent('App', () => App);

server
  .disable('x-powered-by')
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR))
  .get('/*', (req, res) => {
    console.log(req.url);
    // const navigationAction = App.router.getActionForPathAndParams('/b', {});
    // console.log('nav Action', navigationAction);
    // const tempAction = {};
    // const navigationState = App.router.getStateForAction(tempAction);
    const html = 'wat';
    const css = '';
    console.log('Aaaap', Object.keys(App));

    // const { element, getStyleElement } = AppRegistry.getApplication('App', {
    //   navigation: {
    //     state: navigationState,
    //     addListener: () => {},
    //     dispatch: () => {},
    //     isFocused: () => true,
    //   },
    // });

    // const html = ReactDOMServer.renderToString(element);
    // const css = ReactDOMServer.renderToStaticMarkup(getStyleElement());

    res.send(
      `<!doctype html>
    <html lang="">
    <head>
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta charSet='utf-8' />
        <title>This env finally works!</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style id="root-stylesheet">
        html, body, #root {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
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

export default server;
