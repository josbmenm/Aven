import App from './WingWebApp';

import express from 'express';
import ReactDOMServer from 'react-dom/server';
import { AppRegistry } from '@rn';
import { createSessionClient, CloudContext } from '@aven/cloud-core';
import { createProtectedSource } from '@aven/cloud-auth';
import { startFSStorageSource } from '@aven/cloud-fs';
import { attachWebServer } from '@aven/web-server';
import { SMSAgent } from '@aven/sms-agent-twilio';
import { EmailAgent } from '@aven/email-agent-sendgrid';
import { SMSAuthProvider } from '@aven/cloud-auth-sms';
import { EmailAuthProvider } from '@aven/cloud-auth-email';
import { RootAuthProvider } from '@aven/cloud-auth-root';
import { hashSecureString } from '@aven/cloud-utils';
// import { TaskReducer } from '../todo-app/FullHome';

const clientBundleSrc =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8081/src/aven/wing-web/WingWebClient.js.bundle?platform=web'
    : `/main.js`;

const assetBundleSrc =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8081/src/aven/wing-web/WingWebClient.js.assets?platform=web'
    : null;

const path = require('path');
const clientPath = path.join(__dirname, '../../../client');

console.log('running', clientPath);

const getEnv = c => process.env[c];

const runServer = async () => {
  console.log('☁️ Starting Cloud 💨');

  const storageSource = await startFSStorageSource({
    domain: 'todo.aven.io',
    dataDir: './db',
  });

  const source = createSessionClient({
    source: storageSource,
    domain: 'todo.aven.io',
    auth: null,
  });
  // source.setReducer('TaskActions', 'Tasks', TaskReducer);

  const emailAgent =
    process.env.SENDGRID_API_KEY &&
    EmailAgent({
      defaultFromEmail: 'Aven Todos <support@aven.io>',
      config: {
        sendgridAPIKey: process.env.SENDGRID_API_KEY,
      },
    });
  const emailAuthProvider =
    emailAgent &&
    EmailAuthProvider({
      agent: emailAgent,
    });

  const smsAgent =
    process.env.TWILIO_ACCOUNT_SID &&
    SMSAgent({
      defaultFromNumber: process.env.TWILIO_FROM_NUMBER,
      config: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
      },
    });
  const smsAuthProvider =
    smsAgent &&
    SMSAuthProvider({
      agent: smsAgent,
      getMessage: (authCode, verifyInfo, accountId) => {
        return `Todos App Auth Code: ${authCode}`;
      },
    });

  // UNSAFE, TESTING ONLY! DELETE ME BEFORE PRODUCTION!
  // const rootAuthProvider = RootAuthProvider({
  //   rootPasswordHash: await hashSecureString('pw'),
  // });

  // const protectedSource = createProtectedSource({
  //   source,
  //   providers: [smsAuthProvider, emailAuthProvider, rootAuthProvider].filter(
  //     provider => provider,
  //   ),
  // });

  // async function putPermission({ name, defaultRule }) {
  //   await protectedSource.dispatch({
  //     domain: 'todo.aven.io',
  //     type: 'PutPermissionRules',
  //     auth: {
  //       accountId: 'root',
  //       verificationInfo: {},
  //       verificationResponse: { password: 'pw' },
  //     },
  //     defaultRule,
  //     name,
  //   });
  // }

  // await putPermission({
  //   defaultRule: { canRead: true, canWrite: true },
  //   name: 'Todos',
  // });
  // await putPermission({
  //   defaultRule: { canRead: true, canWrite: true },
  //   name: 'Message',
  // });
  // await putPermission({
  //   defaultRule: { canRead: true, canWrite: true },
  //   name: 'TaskActions',
  // });
  // await putPermission({
  //   defaultRule: { canRead: true },
  //   name: 'TaskActions^TaskReducer',
  // });

  // const client = createCloudClient({
  //   source: protectedSource,
  //   domain: 'todo.aven.io',
  // });

  // (await source.observeDoc(
  //   'todo.aven.io',
  //   'TaskActions^TaskReducer',
  // )).subscribe({
  //   next: v => {
  //     console.log('observed actions', v);
  //   },
  // });

  const context = new Map();

  context.set(CloudContext, source);
  const webService = await attachWebServer({
    App,
    context,
    source,
    serverListenLocation: '8080',
    publicDir: clientPath,
    assets: {
      client: {
        js: clientBundleSrc,
        // assets: assetBundleSrc,
      },
    },
  });

  console.log('☁️️ Web Ready 🕸');

  return {
    close: async () => {
      await webService.close();
      await source.close();
    },
  };
};
if (require.main === module) {
  runServer()
    .then(() => {
      console.log('Started!');
    })
    .catch(err => {
      console.error('Error running server');
      console.error(err);
      process.exit(1);
    });
}
export default runServer;

// const fs = require('fs');
// const path = require('path');
// // const clientDir = path.join(__dirname, "../client");
// // const clientFiles = fs.readdirSync(clientDir);
// // const clientBundleSrc = clientFiles.find(f =>
// //   f.match(/^client\.(.*)\.js$/)
// // )[0];

// const indexHTML = ({ headContent, appContent }) => `
// <!DOCTYPE html>
// <html>
//   <head>
//     <meta charset="UTF-8" />
//     <meta content="text/html;charset=utf-8" http-equiv="Content-Type" />
//     <meta content="utf-8" http-equiv="encoding" />
//     <meta
//       name="viewport"
//       content="width=device-width, initial-scale=1, shrink-to-fit=no"
//     />
//     <style id="root-stylesheet">
//       #app,
//       body,
//       html {
//         width: 100%;
//         height: 100%;
//         display: flex;
//         flex-direction: column;
//       }
//       input,
//       textarea {
//         -webkit-appearance: none;
//         -webkit-border-radius: 0;
//         border-radius: 0;
//       }
//     </style>
//     ${headContent}
//   </head>
//   <body>
//     <div id="app">${appContent}</div>
//     <script id="js-entrypoint" src="${clientBundleSrc}"></script>
//   </body>
// </html>
// `;

// const app = express();

// AppRegistry.registerComponent('App', () => App);
// app.disable('x-powered-by');
// // app.use(express.static(clientDir, { index: false }));
// app.get('/*', (req, res) => {
//   const { element, getStyleElement } = AppRegistry.getApplication('App', {});
//   const html = ReactDOMServer.renderToString(element);
//   const css = ReactDOMServer.renderToStaticMarkup(getStyleElement());
//   let indexFile = indexHTML({
//     headContent: css,
//     appContent: html,
//   });
//   res.send(indexFile);
// });

// app.listen(8080, () => {
//   console.log('Server started at http://localhost:8080/');
// });
