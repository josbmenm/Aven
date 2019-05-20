import express from 'express';
import ReactDOMServer from 'react-dom/server';
import { AppRegistry } from 'react-native-web';
import React from 'react';
import startSourceServer from '../cloud-server/startSourceServer';
import NavigationContext from '../navigation-core/views/NavigationContext';
import handleServerRequest from '../navigation-web/handleServerRequest';
import Buffer from '../utils/Buffer';
const yes = require('yes-https');
const helmet = require('helmet');
const path = require('path');
const mime = require('mime');

const isProd = process.env.NODE_ENV === 'production';

const sendNotFound = res => {
  res.status(404);
  res.send('Not found');
};

async function blockResponse({
  domain,
  docName,
  dispatch,
  docPath,
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
  if (docPath === '/' || docPath === '') {
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
  const pathParts = docPath.split('/');
  const pathTermName = pathParts[1];
  if (block.value.files[pathTermName]) {
    const childDocPath = `/${pathParts.slice(2).join('/')}`;
    const childId = block.value.files[pathTermName].id;
    return await blockResponse({
      domain,
      docName,
      dispatch,
      blockName: pathTermName,
      blockId: childId,
      docPath: childDocPath,
    });
  }
  return sendNotFound;
}

async function webDataInterface({ domain, docName, dispatch, docPath }) {
  const doc = await dispatch({
    type: 'GetDoc',
    domain,
    name: docName,
  });
  if (!doc || !doc.id) {
    return sendNotFound;
  }
  return await blockResponse({
    domain,
    docName,
    dispatch,
    blockName: docName,
    blockId: doc.id,
    docPath,
  });
}

const devErrorSupresser = `
<script>
// catch errors for suppression before the React dev tools can
window.addEventListener('error', function(evt) {
  if (evt.error.suppressInDevTools) {
    evt.stopImmediatePropagation();
    evt.preventDefault();
  }
});
</script>
`;

export default async function WebServer({
  App,
  source,
  context,
  serverListenLocation,
  expressRouting = undefined,
  assets,
  onLogEvent,
}) {
  function reportInfo(message) {
    onLogEvent && onLogEvent(2, message);
  }
  function reportWarning(message) {
    onLogEvent && onLogEvent(1, message);
  }
  function reportError(message) {
    onLogEvent && onLogEvent(0, message);
  }
  function doExpressRouting(app) {
    process.env.ENFORCE_HTTPS && app.use(yes());
    app.use(helmet());
    app.use((req, res, next) => {
      reportInfo(`${req.method} request to ${req.headers.host} ${req.path}`);
      next();
    });
    app.use(function(req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept',
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

    app.disable('x-powered-by');
    app.use(express.static(publicDir));
  }
  function doFallbackExpressRouting(app) {
    expressRouting && expressRouting(app);

    app.get('/_/:domain/:docName*', (req, res) => {
      const docName = req.params.docName;
      const domain = req.params.domain;
      const docPath = req.params['0'];

      webDataInterface({
        domain,
        docName,
        docPath,
        dispatch: source.dispatch,
      })
        .then(responder => {
          responder(res);
        })
        .catch(e => {
          res.status(500);
          console.error(e);
          res.send(JSON.stringify(e.toJSON()));
        });
    });

    app.get('/*', (req, res) => {
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
          ${
            /*<meta name="viewport" content="width=device-width, initial-scale=1">*/ ''
          }
          <style id="root-stylesheet">
          html, body, #root {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
          }
          ${options.customCSS ? options.customCSS : ''}
          </style>
          ${isProd ? '' : devErrorSupresser}
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
  </html>`,
      );
    });
  }
  return await startSourceServer({
    source,
    listenLocation: serverListenLocation,
    expressRouting: doExpressRouting,
    fallbackExpressRouting: doFallbackExpressRouting,
  });
}
