import CloudContext from '../cloud-core/CloudContext';
import { createClient } from '../cloud-core/Kite';
import createMemoryStorageSource from '../cloud-core/createMemoryStorageSource';
import attachWebServer from '../aven-web/attachWebServer';

import App from './App';

const runServer = async () => {
  console.log('☁️ Starting Cloud 💨');

  const source = await createMemoryStorageSource({
    domain: 'example.aven.cloud',
  });
  const client = createClient({
    source,
    domain: 'example.aven.cloud',
  });

  const getEnv = c => process.env[c];
  const serverListenLocation = getEnv('PORT');
  const context = new Map();
  context.set(CloudContext, client);
  const webService = await attachWebServer({
    App,
    context,
    source,
    serverListenLocation,
    // assets: require(process.env.RAZZLE_ASSETS_MANIFEST),
    assets: null,
  });
  console.log('☁️️ Web Ready 🕸');

  return {
    close: async () => {
      await webService.close();
      await source.close();
    },
  };
};

export default runServer;
