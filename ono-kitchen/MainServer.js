import App from './App';
import WebServer from '../aven-web/WebServer';
import startPostgresDataSource from '../aven-data-source-postgres/startPostgresDataSource';
import startDataService from '../aven-data-server/startDataService';
import startMemoryDataSource from '../aven-data-server/startMemoryDataSource';
import startNetworkDataSource from '../aven-data-server/startNetworkDataSource';
import composeDataSources from '../aven-data-server/composeDataSources';
import { getSecretConfig, IS_DEV } from '../aven-web/config';

import { kitchenDispatchCommand, connectKitchenDataSource } from './Robot';

const runServer = async () => {
  console.log('☁️ Starting Restaurant Server 💨');

  const domain = 'maui.onofood.co';

  const pgConfig = {
    ssl: true,
    user: getSecretConfig('SQL_USER'),
    password: getSecretConfig('SQL_PASSWORD'),
    database: getSecretConfig('SQL_DATABASE'),
    host: getSecretConfig('SQL_HOST'),
  };

  const pgDataSource = await startPostgresDataSource({
    pgConfig,
    rootDomain: domain,
  });
  const memoryDataSource = await startMemoryDataSource({
    rootDomain: domain,
  });
  const networkDataSource = await startNetworkDataSource({
    domain: 'onofood.co',
    host: {
      authority: 'www.onofood.co',
    },
  });
  const dataService = await startDataService({
    // dataSource: composeDataSources([pgDataSource, memoryDataSource]),
    // dataSource: memoryDataSource,
    dataSource: networkDataSource,
    rootDomain: domain,
  });

  connectKitchenDataSource(memoryDataSource, 'KitchenState');

  const dispatch = async action => {
    switch (action.type) {
      case 'kitchenCommand':
        // subsystem (eg 'IOSystem'), pulse (eg ['home']), values (eg: foo: 123)
        return await kitchenDispatchCommand(action);
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
      await pgDataSource.close();
      await memoryDataSource.close();
      await dataService.close();
      await webService.close();
    },
  };
};

export default runServer;
