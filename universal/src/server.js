import express from 'express';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import { AppRegistry } from 'react-native';

import { handleServerRequest } from './react-navigation-web';

import App from './AppWeb';

import iconFont from './react-navigation-icons/fonts/Ionicons.ttf';

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);

const server = express();

AppRegistry.registerComponent('App', () => App);

server
  .disable('x-powered-by')
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR))
  .get('/*', (req, res) => {
    const { path, query } = req;

    const { navigation, title } = handleServerRequest(App.router, path, query);

    const { element, getStyleElement } = AppRegistry.getApplication('App', {
      initialProps: {
        navigation,
      },
    });

    const html = ReactDOMServer.renderToString(element);
    const css = ReactDOMServer.renderToStaticMarkup(getStyleElement());

    const iconFontStyles = `@font-face {
  src: url(${iconFont});
  font-family: Ionicons;
}`;

    // // Create stylesheet
    // const style = document.createElement('style');
    // style.type = 'text/css';
    // if (style.styleSheet) {
    //   style.styleSheet.cssText = iconFontStyles;
    // } else {
    //   style.appendChild(document.createTextNode(iconFontStyles));
    // }

    // // Inject stylesheet
    // document.head.appendChild(style);

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
        ${iconFontStyles}
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
