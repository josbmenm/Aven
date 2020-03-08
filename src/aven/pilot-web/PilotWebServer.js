import App from './PilotWebApp';
import { createSessionClient, CloudContext } from '@aven/cloud-core';
import { startFSStorageSource } from '@aven/cloud-fs';
import { attachWebServer } from '@aven/web-server';

const path = require('path');
const HOME = require('os').homedir();
console.log('Uh2');

const runServer = async () => {
  console.log('☁️ Starting Cloud 💨');

  const storageSource = await startFSStorageSource({
    domain: 'pilot.aven.io',
    dataDir: HOME + '/db',
  });

  const source = createSessionClient({
    source: storageSource,
    domain: 'todo.aven.io',
    auth: null,
  });

  const context = new Map();

  context.set(CloudContext, source);
  const webService = await attachWebServer({
    App,
    context,
    source,
    serverListenLocation: process.env.LISTEN_PATH || '8080',
    publicDir: path.join(__dirname, '../../../client'),
    assets: {
      client: {
        js:
          process.env.NODE_ENV === 'development'
            ? 'http://localhost:8081/src/aven/pilot-web/PilotWebClient.js.bundle?platform=web'
            : `/main.js`,
      },
    },
    publicDir: [!__DEV__ && path.join(__dirname, '../../../public')],
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
