import App from './App';
import WebServer from '../aven-web/WebServer';
import startSQLDataSource from '../aven-cloud-sql/startSQLDataSource';
import createNodeNetworkSource from '../aven-cloud-server/createNodeNetworkSource';
import createCloudClient from '../aven-cloud/createCloudClient';
import createFSClient from '../aven-cloud-server/createFSClient';
import createOnoCloudClient from '../ono-cloud/createOnoCloudClient';
import CloudContext from '../aven-cloud/CloudContext';
import OnoRestaurantContext from '../ono-cloud/OnoRestaurantContext';
import { getSecretConfig, IS_DEV } from '../aven-web/config';
import scrapeAirTable from '../skynet/scrapeAirTable';
import { getMobileAuthToken } from '../skynet/Square';

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

  console.log(JSON.stringify(pgConfig));

  const dataSource = await startSQLDataSource({
    client: 'pg', // must have sqlite3 in the dependencies of this module.
    connection: pgConfig,
  });

  const kitchenClient = createCloudClient({
    dataSource: dataSource,
    domain: 'kitchen.maui.onofood.co',
  });

  const fsClient = createFSClient({ client: kitchenClient });

  const kitchen = startKitchen({
    client: kitchenClient,
    plcIP: '192.168.1.122',
  });

  let restaurantState = null;
  let kitchenState = null;

  function evaluateKitchenState(kitchenState) {
    const isFillSystemReady =
      kitchenState.FillSystem_PrgStep_READ === 0 &&
      kitchenState.FillSystem_NoFaults_READ &&
      kitchenState.FillSystem_Homed_READ;
    const isReadyToGoToPosition =
      kitchenState.FillPositioner_GoToPositionReady_READ;
    const isReadyToFill =
      isReadyToGoToPosition &&
      kitchenState.FillSystem_PositionAndDispenseAmountReady_READ;
    return {
      isFillSystemReady,
      isReadyToGoToPosition,
      isReadyToFill,
      isReadyToStartOrder: isReadyToFill,
      isReadyToDeliver: isReadyToFill,
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
    await delay(250);
  }
  async function startOrder() {
    await kitchen.dispatchCommand({
      subsystem: 'FillPositioner',
      pulse: ['GoToPosition'],
      values: {
        PositionDest: 1,
      },
    });
    await delay(2550);
  }
  async function runDeliver() {
    await kitchen.dispatchCommand({
      subsystem: 'FillPositioner',
      pulse: ['GoToPosition'],
      values: {
        PositionDest: 45500,
      },
    });
    await delay(550);
  }
  async function applySideEffects(restaurantState, kitchenState) {
    if (!restaurantState || !kitchenState) {
      return;
    }
    const {
      isReadyToFill,
      isReadyToStartOrder,
      isReadyToDeliver,
    } = evaluateKitchenState(kitchenState);

    const queuedOrders = restaurantState.queuedOrders || [];

    if (
      isReadyToStartOrder &&
      queuedOrders.length &&
      restaurantState.fillingOrder == null
    ) {
      const order = queuedOrders[0];
      const nextState = {
        ...restaurantState,
        queuedOrders: queuedOrders.slice(1),
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
      console.log('starting order!');
      await startOrder();
      return;
    }

    if (
      restaurantState.fillingOrder &&
      isReadyToFill &&
      restaurantState.fills.length
    ) {
      const fillToRun = restaurantState.fills[0];
      await restaurant.put({
        ...restaurantState,
        fills: restaurantState.fills.slice(1),
      });
      console.log('filling ' + fillToRun.system);
      await runFill(fillToRun);
      return;
    }

    if (
      restaurantState.fillingOrder &&
      !restaurantState.fills.length &&
      restaurantState.deliveringOrder == null &&
      isReadyToDeliver
    ) {
      await restaurant.put({
        ...restaurantState,
        fills: [],
        fillingOrder: null,
        deliveringOrder: restaurantState.fillingOrder,
      });
      console.log('delivering ');
      await runDeliver();
      return;
    }

    if (restaurantState.deliveringOrder && isReadyToDeliver) {
      // fills are complete, move on. right now that means we are done
      console.log('order complete!');
      await restaurant.put({
        ...restaurantState,
        fills: [],
        deliveringOrder: null,
        completeOrders: [
          ...(restaurantState.completeOrders || []),
          restaurantState.deliveringOrder,
        ],
      });
      return;
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
      case 'GetSquareMobileAuthToken':
        return getMobileAuthToken(action);
      default:
        return await dataSource.dispatch(action);
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

  context.set(CloudContext, kitchenClient);
  context.set(OnoRestaurantContext, kitchenClient);
  const webService = await WebServer({
    App,
    context,
    dataSource: {
      ...dataSource,
      dispatch,
    },
    serverListenLocation,
  });
  console.log('☁️️ Web Ready 🕸');

  return {
    close: async () => {
      // await pgDataSource.close();
      await dataSource.close();
      // await networkDataSource.close();
      await webService.close();
      await kitchen.close();
    },
  };
};

export default runServer;
