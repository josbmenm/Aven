const ReactDOMServer = require('react-dom/server');

const { AppRegistry } = require('react-native-web');
const moduleAlias = require('module-alias');
moduleAlias.addAliases({
  'react-native': require.resolve('react-native-web'),
});

moduleAlias();

AppRegistry.registerComponent(
  'App',
  () => require('@aven/something-app').default,
);

const path = require('path');
//
//
const express = require('express');

console.log('=== Server.js');

function startServer() {
  console.log('=== startServer');

  const app = express();

  app.get('/', (req, res) => {
    const { element, getStyleElement } = AppRegistry.getApplication('App', {
      initialProps: {},
    });
    const css = ReactDOMServer.renderToStaticMarkup(getStyleElement());
    res.send(`
<html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta charSet='utf-8' />
    <title>Hello, React SSR</title>
    <style id="root-stylesheet">
            html, body, #root {
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
            }
            input, textarea {
              -webkit-appearance: none;
              -webkit-border-radius: 0;
            }
            </style>
            ${css}
</head>
<body>
    ${ReactDOMServer.renderToString(element)}
    <script>
    window.globalRequire = thing => window.__r(thing);
    </script>
    <script src="http://localhost:8081/packages/something-browser/Client.js.bundle?platform=browser"></script>
</body>
</html>
    `);
  });
  app.listen(8000);
}

startServer();

// module.exports = startServer;
