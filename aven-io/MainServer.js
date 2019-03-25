import App from './App';
import WebServer from '../aven-web/WebServer';
import createMemoryDataSource from '../cloud-core/createMemoryDataSource';
import startFSDataSource from '../cloud-fs/startFSDataSource';
import createCloudClient from '../cloud-core/createCloudClient';
import CloudContext from '../cloud-core/CloudContext';

const runServer = async () => {
  console.log('☁️ Starting Cloud 💨');

  // const dataSource = await startFSDataSource({
  //   domain: 'example.aven.cloud',
  //   dataDir: process.cwd() + '/db',
  // });

  const dataSource = await createMemoryDataSource({
    domain: 'example.aven.cloud',
  });

  const cloud = createCloudClient({
    dataSource,
    domain: 'example.aven.cloud',
  });

  // const authenticatedDataSource = authenticatedDataSource({
  //   dataSource
  // })

  const getEnv = c => process.env[c];
  const serverListenLocation = getEnv('PORT');
  const context = new Map();
  context.set(CloudContext, cloud);
  const webService = await WebServer({
    App,
    context,
    dataSource,
    serverListenLocation,
  });
  console.log('☁️️ Web Ready 🕸');

  return {
    close: async () => {
      await webService.close();
      await dataSource.close();
    },
  };
};

export default runServer;
