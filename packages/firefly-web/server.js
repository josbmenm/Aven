import App from './FireflyApp';

import express from 'express';
import ReactDOMServer from 'react-dom/server';
import { AppRegistry } from 'react-native';

const fs = require('fs');
const path = require('path');
const clientDir = path.join(__dirname, '../client');
const clientFiles = fs.readdirSync(clientDir);
const clientBundleName = clientFiles.find(f => f.match(/^client\.(.*)\.js$/));
const indexHTML = String(fs.readFileSync(`${clientDir}/index.html`));
console.log(indexHTML);
// console.log();

const app = express();

AppRegistry.registerComponent('App', () => App);
app.disable('x-powered-by');
app.use(express.static(clientDir, { index: false }));
app.get('/*', (req, res) => {
  // register the app

  // prerender the app
  const { element, getStyleElement } = AppRegistry.getApplication('App', {});
  // first the element
  const html = ReactDOMServer.renderToString(element);
  // then the styles
  const css = ReactDOMServer.renderToStaticMarkup(getStyleElement());

  let indexFile = indexHTML;
  indexFile = indexFile.replace(/<meta id="rn-styles">/, css);
  indexFile = indexFile.replace(
    /<div id="app"><\/div>/,
    `<div id="app">${html}</div>`,
  );
  console.log('injecting', indexFile);

  res.send(indexFile);
  //     res.send(indexHTML.replace('<div id="app"></div>', `<div id="app">${html}</div>`)
  //       `<!doctype html>
  //     <html lang="">
  //     <head>
  //         <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  //         <meta charSet='utf-8' />
  //         <title>Welcome</title>
  //         <meta name="viewport" content="width=device-width, initial-scale=1">
  //         ${css}

  //     </head>
  //     <body>
  //         <div id="root">${html}</div>
  //   ${
  //     process.env.NODE_ENV === 'production'
  //       ? `<script src="${assets.client.js}" defer></script>`
  //       : `<script src="${assets.client.js}" defer crossorigin></script>`
  //   }
  //     </body>
  // </html>`,
  //     );
});

// app.get('/', (req, res) => {
//   res.send('asdff');
// });

app.listen(8080, () => {
  console.log('Server started at http://localhost:8080/');
});
