import App from './App';
import { attachWebServer } from '@aven-cloud/aven-web-server';
import {
  createClient,
  CloudContext,
  createMemoryStorageSource,
} from '@aven-cloud/cloud-core';

export default async function startAvenServer(httpServer) {
  console.log('☁️ Starting Cloud 💨');

  // const source = await startFSStorageSource({
  //   domain: 'example.aven.cloud',
  //   dataDir: process.cwd() + '/db',
  // });

  const source = await createMemoryStorageSource({
    domain: 'example.aven.cloud',
  });

  const cloud = createClient({
    source,
    domain: 'example.aven.cloud',
  });

  const getEnv = c => process.env[c];
  const serverListenLocation = getEnv('PORT');
  const context = new Map();
  context.set(CloudContext, cloud);
  const webService = await attachWebServer({
    httpServer,
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
}
