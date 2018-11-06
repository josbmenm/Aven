import App from './App';
import WebServer from '../aven-web/WebServer';
import startPostgresDataSource from '../aven-cloud-postgres/startPostgresDataSource';
import startMemoryDataSource from '../aven-cloud/startMemoryDataSource';
import startRemoteDataSource from '../aven-cloud/startRemoteDataSource';
import createCloudClient from '../aven-cloud/createCloudClient';
import createOnoCloudClient from '../ono-cloud/createOnoCloudClient';
import OnoCloudContext from '../ono-cloud/OnoCloudContext';
import OnoRestaurantContext from '../ono-cloud/OnoRestaurantContext';
import { getSecretConfig, IS_DEV } from '../aven-web/config';

import { kitchenDispatchCommand, connectKitchenClient } from './Robot';

const runServer = async () => {
  console.log('☁️ Starting Restaurant Server 💨');

  const pgConfig = {
    ssl: true,
    user: getSecretConfig('SQL_USER'),
    password: getSecretConfig('SQL_PASSWORD'),
    database: getSecretConfig('SQL_DATABASE'),
    host: getSecretConfig('SQL_HOST'),
  };

  // const pgDataSource = await startPostgresDataSource({
  //   pgConfig,
  //   rootDomain: 'maui.onofood.co',
  // });
  const memoryDataSource = await startMemoryDataSource({
    domain: 'kitchen.maui.onofood.co',
  });
  // const networkDataSource = await startRemoteDataSource({
  //   domain: 'onofood.co',
  //   host: {
  //     authority: 'www.onofood.co',
  //   },
  // });
  const kitchenClient = createCloudClient({
    dataSource: memoryDataSource,
    domain: 'kitchen.maui.onofood.co',
  });

  connectKitchenClient(kitchenClient, 'kitchen.maui.onofood.co');

  const dispatch = async action => {
    switch (action.type) {
      case 'KitchenCommand':
        // subsystem (eg 'IOSystem'), pulse (eg ['home']), values (eg: foo: 123)
        return await kitchenDispatchCommand(action);
      default:
        return await memoryDataSource.dispatch(action);
    }
  };

  const getEnv = c => process.env[c];
  const serverListenLocation = getEnv('PORT');

  const context = new Map();

  // const avenClient = createCloudClient(networkDataSource);

  // const onoCloudClient = createOnoCloudClient(avenClient);

  // context.set(OnoCloudContext, onoCloudClient);
  context.set(OnoRestaurantContext, kitchenClient);
  const webService = await WebServer({
    App,
    context,
    dataSource: {
      ...memoryDataSource,
      dispatch,
    },
    serverListenLocation,
  });
  console.log('☁️️ Web Ready 🕸');

  return {
    close: async () => {
      // await pgDataSource.close();
      await memoryDataSource.close();
      // await networkDataSource.close();
      await webService.close();
    },
  };
};

export default runServer;
