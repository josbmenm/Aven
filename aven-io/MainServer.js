import App from './App';
import WebServer from '../aven-web/WebServer';
import createMemoryStorageSource from '../cloud-core/createMemoryStorageSource';
import startFSStorageSource from '../cloud-fs/startFSStorageSource';
import createCloudClient from '../cloud-core/createCloudClient';
import CloudContext from '../cloud-core/CloudContext';

const runServer = async () => {
  console.log('☁️ Starting Cloud 💨');

  // const source = await startFSStorageSource({
  //   domain: 'example.aven.cloud',
  //   dataDir: process.cwd() + '/db',
  // });

  const source = await createMemoryStorageSource({
    domain: 'example.aven.cloud',
  });

  const cloud = createCloudClient({
    source,
    domain: 'example.aven.cloud',
  });

  const getEnv = c => process.env[c];
  const serverListenLocation = getEnv('PORT');
  const context = new Map();
  context.set(CloudContext, cloud);
  const webService = await WebServer({
    App,
    context,
    source,
    serverListenLocation,
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
