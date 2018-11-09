import App from './App';
import WebServer from '../aven-web/WebServer';
import startPostgresDataSource from '../aven-cloud-postgres/startPostgresDataSource';
import startMemoryDataSource from '../aven-cloud/startMemoryDataSource';
import createNodeNetworkSource from '../aven-cloud-server/createNodeNetworkSource';
import createCloudClient from '../aven-cloud/createCloudClient';
import createFSClient from '../aven-cloud-server/createFSClient';
import createOnoCloudClient from '../ono-cloud/createOnoCloudClient';
import OnoCloudContext from '../ono-cloud/OnoCloudContext';
import OnoRestaurantContext from '../ono-cloud/OnoRestaurantContext';
import { getSecretConfig, IS_DEV } from '../aven-web/config';
import scrapeAirTable from '../ono-website/scrapeAirTable';

import startKitchen from './startKitchen';
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

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

  // const networkDataSource = await createNodeNetworkSource({
  //   domain: 'onofood.co',
  //   host: {
  //     authority: 'www.onofood.co',
  //   },
  // });
  // const mainDataSource = fallbackDataSource(
  //   memoryDataSource,
  //   networkDataSource
  // )

  const kitchenClient = createCloudClient({
    dataSource: memoryDataSource,
    domain: 'kitchen.maui.onofood.co',
  });

  const fsClient = createFSClient({ client: kitchenClient });

  const kitchen = startKitchen({
    client: kitchenClient,
    plcIP: '192.168.1.122',
  });

  let restaurantState = null;
  let kitchenState = null;
  let hasKitchenStateChanged = false;

  function evaluateKitchenState(kitchenState) {
    const isFillSystemReady =
      kitchenState.FillSystem_PrgStep_READ === 0 &&
      kitchenState.FillSystem_NoFaults_READ &&
      kitchenState.FillSystem_Homed_READ;
    const isReadyToStartOrder = isFillSystemReady;
    return {
      isFillSystemReady,
      isReadyToStartOrder,
      isReadyToFill: isReadyToStartOrder,
    };
  }
  const restaurant = kitchenClient.getRef('Restaurant');

  async function runFill({ amount, system, slot }) {
    await kitchen.dispatchCommand({
      subsystem: 'FillSystem',
      pulse: ['PositionAndDispenseAmount'],
      values: {
        DispenseAmount: amount,
        DispenseSystem: system,
        SlotToDispense: slot,
      },
    });
    await delay(500);
  }
  async function startOrder() {
    await kitchen.dispatchCommand({
      subsystem: 'FillPositioner',
      pulse: ['GoToPosition'],
      values: {
        PositionDest: 0,
      },
    });
    await delay(500);
  }
  async function applySideEffects(restaurantState, kitchenState) {
    if (!restaurantState || !kitchenState) {
      return;
    }
    const { isReadyToFill, isReadyToStartOrder } = evaluateKitchenState(
      kitchenState,
    );
    console.log('applySideEffects', { isReadyToFill, isReadyToStartOrder });
    const queue = restaurantState.queuedOrders || [];

    if (
      isReadyToStartOrder &&
      queue.length &&
      restaurantState.fillingOrder == null
    ) {
      const order = queue[0];
      const nextState = {
        ...restaurantState,
        queuedOrders: queue.slice(1),
        fills: [
          {
            amount: 2,
            system: 1,
            slot: 0,
          },
          {
            amount: 2,
            system: 0,
            slot: 0,
          },
        ],
        fillingOrder: order,
      };
      await restaurant.put(nextState);
      await startOrder();
    }

    if (restaurantState.fillingOrder && isReadyToFill) {
      if (restaurantState.fills.length) {
        const fillToRun = restaurantState.fills[0];
        await restaurant.put({
          ...restaurantState,
          fills: restaurantState.fills.slice(1),
        });
        await runFill(fillToRun);
      } else {
        // fills are complete, move on. right now that means we are done
        await restaurant.put({
          ...restaurantState,
          fills: [],
          fillingOrder: null,
          completeOrders: [
            ...(restaurantState.completeOrders || []),
            restaurantState.fillingOrder,
          ],
        });
      }
    }
  }

  let effectedRestaurantState = undefined;
  let effectedKitchenState = undefined;
  let effectInProgress = null;

  function runSideEffects() {
    if (effectInProgress) {
      return;
    }
    const newRestaurantState = restaurantState;
    const newKitchenState = kitchenState;
    if (
      newRestaurantState !== effectedRestaurantState ||
      newKitchenState !== effectedKitchenState
    ) {
      effectInProgress = true;
      applySideEffects(newRestaurantState, newKitchenState)
        .then(() => {})
        .catch(e => {
          console.error(e);
        })
        .finally(() => {
          effectedRestaurantState = newRestaurantState;
          effectedKitchenState = newKitchenState;
          effectInProgress = false;
          runSideEffects();
        });
    }
  }

  kitchenClient.getRef('KitchenState').observeValue.subscribe({
    next: v => {
      kitchenState = v;
      runSideEffects();
    },
  });
  kitchenClient.getRef('Restaurant').observeValue.subscribe({
    next: v => {
      restaurantState = v;
      runSideEffects();
    },
  });

  const dispatch = async action => {
    switch (action.type) {
      case 'KitchenCommand':
        // subsystem (eg 'IOSystem'), pulse (eg ['home']), values (eg: foo: 123)
        return await kitchen.dispatchCommand(action);
      case 'UpdateAirtable':
        return await scrapeAirTable(fsClient);
      default:
        return await memoryDataSource.dispatch(action);
    }
  };

  scrapeAirTable(fsClient)
    .then(() => {
      console.log('Airtable Updated');
    })
    .catch(console.error);

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
      await kitchen.close();
    },
  };
};

export default runServer;
