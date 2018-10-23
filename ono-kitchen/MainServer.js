import App from './App';
import WebServer from '../aven-web/WebServer';
import startPostgresDataSource from '../aven-data-source-postgres/startPostgresDataSource';
import startDataService from '../aven-data-server/startDataService';
import startMemoryDataSource from '../aven-data-server/startMemoryDataSource';
import startRemoteDataSource from '../aven-data-server/startRemoteDataSource';
import composeDataSources from '../aven-data-server/composeDataSources';
import { getSecretConfig, IS_DEV } from '../aven-web/config';

import { kitchenDispatchCommand, connectKitchenDataSource } from './Robot';

const runServer = async () => {
  console.log('☁️ Starting Restaurant Server 💨');

  const pgConfig = {
    ssl: true,
    user: getSecretConfig('SQL_USER'),
    password: getSecretConfig('SQL_PASSWORD'),
    database: getSecretConfig('SQL_DATABASE'),
    host: getSecretConfig('SQL_HOST'),
  };

  const pgDataSource = await startPostgresDataSource({
    pgConfig,
    rootDomain: 'maui.onofood.co',
  });
  const memoryDataSource = await startMemoryDataSource({
    domain: 'kitchen.maui.onofood.co',
  });
  const networkDataSource = await startRemoteDataSource({
    domain: 'onofood.co',
    host: {
      authority: 'www.onofood.co',
    },
  });
  const dataService = await startDataService({
    // dataSource: composeDataSources([pgDataSource, memoryDataSource]),
    dataSource: memoryDataSource,
    // dataSource: networkDataSource,
  });

  connectKitchenDataSource(memoryDataSource, 'kitchen.maui.onofood.co');

  const dispatch = async action => {
    switch (action.type) {
      case 'kitchenCommand':
        // subsystem (eg 'IOSystem'), pulse (eg ['home']), values (eg: foo: 123)
        return await kitchenDispatchCommand(action);
      default:
        return await dataService.dispatch(action);
    }
  };

  const getEnv = c => process.env[c];
  const serverListenLocation = getEnv('PORT');

  const webService = await WebServer({
    App,
    dispatch,
    startSocketServer: dataService.startSocketServer,
    serverListenLocation,
  });
  console.log('☁️️ Web Ready 🕸');

  return {
    close: async () => {
      await pgDataSource.close();
      await memoryDataSource.close();
      await networkDataSource.close();
      await dataService.close();
      await webService.close();
    },
  };
};

export default runServer;
