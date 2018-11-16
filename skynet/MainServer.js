import App from './App';
import WebServer from '../aven-web/WebServer';
import { getSecretConfig, IS_DEV } from '../aven-web/config';
import startSQLDataSource from '../aven-cloud-sql/startSQLDataSource';
// import startMemoryDataSource from '../aven-cloud/startMemoryDataSource';
import scrapeAirTable from './scrapeAirTable';
import createCloudClient from '../aven-cloud/createCloudClient';
import createFSClient from '../aven-cloud-server/createFSClient';
import OnoCloudContext from '../ono-cloud/OnoCloudContext';
import { getMobileAuthToken } from './Square';

const runServer = async () => {
  console.log('☁️ Starting Website 💨');

  const domain = 'onofood.co';
  console.log('☁️ Starting Cloud 💨');
  const pgConfig = {
    user: getSecretConfig('SQL_USER'),
    password: getSecretConfig('SQL_PASSWORD'),
    database: getSecretConfig('SQL_DATABASE'),
    ssl: true,
  };

  if (getSecretConfig('SQL_INSTANCE_CONNECTION_NAME') && !IS_DEV) {
    pgConfig.host = `/cloudsql/${getSecretConfig(
      'SQL_INSTANCE_CONNECTION_NAME',
    )}`;
  } else if (getSecretConfig('SQL_HOST')) {
    pgConfig.host = getSecretConfig('SQL_HOST');
  }
  const dataSource = await startSQLDataSource({
    client: 'sqlite3', // must have sqlite3 in the dependencies of this module.
    connection: {
      filename: 'cloud.sqlite',
    },
  });
  // const dataSource = startMemoryDataSource({
  //   domain,
  // });

  const dataClient = createCloudClient({
    dataSource,
    domain,
  });

  const fsClient = createFSClient({ client: dataClient });

  const context = new Map();
  context.set(OnoCloudContext, dataClient);

  const dispatch = async action => {
    switch (action.type) {
      case 'GetSquareMobileAuthToken':
        return await getMobileAuthToken(action);
      case 'UpdateAirtable':
        return await scrapeAirTable(fsClient);
      case 'Debug':
        return { message: 'The cake is a lie.' };
      default:
        return await dataSource.dispatch(action);
    }
  };

  const getEnv = c => process.env[c];
  const serverListenLocation = getEnv('PORT');
  const webService = await WebServer({
    context,
    mainDomain: domain,
    App,
    dataSource: {
      ...dataSource,
      dispatch,
    },
    serverListenLocation,
  });
  console.log('☁️️ Web Ready 🕸');

  return {
    close: async () => {
      await dataSource.close();
      await webService.close();
    },
  };
};

export default runServer;
