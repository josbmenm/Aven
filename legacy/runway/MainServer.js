import { CloudContext } from '@aven/cloud-core';
import { createCloudClient } from '@aven/cloud-core';
import { createMemoryStorageSource } from '@aven/cloud-core';
import WebServer from '../aven-web/WebServer';

import App from './App';

const runServer = async () => {
  console.log('☁️ Starting Runway 🛫');

  const source = await createMemoryStorageSource({
    domain: 'runway.aven.cloud',
  });
  const client = createCloudClient({
    source,
    domain: 'runway.aven.cloud',
  });

  const getEnv = c => process.env[c];
  const serverListenLocation = getEnv('PORT');
  const context = new Map();
  context.set(CloudContext, client);
  const webService = await WebServer({
    App,
    context,
    source,
    serverListenLocation,
    assets: require(process.env.RAZZLE_ASSETS_MANIFEST),
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
