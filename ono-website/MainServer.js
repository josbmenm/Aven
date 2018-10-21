import App from './App';
import WebServer from '../aven-web/WebServer';
import { getSecretConfig, IS_DEV } from '../aven-web/config';
import startPostgresDataSource from '../aven-data-source-postgres/startPostgresDataSource';
import startDataService from '../aven-data-server/startDataService';
import { scrapeAirTable } from './scrapeAirTable';
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
  const dataSource = await startPostgresDataSource({
    pgConfig,
    rootDomain: domain,
  });
  const dataService = await startDataService({
    dataSource,
    rootDomain: domain,
  });

  const dispatch = async action => {
    switch (action.type) {
      case 'getSquareMobileAuthToken':
        return getMobileAuthToken(action);
      case 'scrapeUpstream':
        return await scrapeAirTable(dataService);
      default:
        return await dataService.dispatch(action);
    }
  };

  const webService = await WebServer({
    mainDomain: domain,
    App,
    dispatch,
    startSocketServer: dataService.startSocketServer,
  });
  console.log('☁️️ Web Ready 🕸');

  return {
    close: async () => {
      await dataSource.close();
      await dataService.close();
      await webService.close();
    },
  };
};

export default runServer;
