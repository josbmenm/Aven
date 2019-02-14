import App from './App';
import WebServer from '../aven-web/WebServer';
import startMemoryDataSource from '../aven-cloud/startMemoryDataSource';
import startFSDataSource from '../aven-cloud-fs/startFSDataSource';
import createCloudClient from '../aven-cloud/createCloudClient';
import CloudContext from '../aven-cloud/CloudContext';

const runServer = async () => {
  console.log('☁️ Starting Cloud 💨');

  // const dataSource = await startFSDataSource({
  //   domain: 'example.aven.cloud',
  //   dataDir: process.cwd() + '/db',
  // });

  const dataSource = await startMemoryDataSource({
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
