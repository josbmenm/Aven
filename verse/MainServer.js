import App from './App';
import WebServer from '../aven-web/WebServer';
import startFSDataSource from '../aven-cloud-fs/startFSDataSource';
// import createNodeNetworkSource from '../aven-cloud-server/createNodeNetworkSource';
import createCloudClient from '../aven-cloud/createCloudClient';
import createFSClient from '../aven-cloud-server/createFSClient';
import CloudContext from '../aven-cloud/CloudContext';
import { getSecretConfig, IS_DEV } from '../aven-web/config';
import scrapeAirTable from '../skynet/scrapeAirTable';
import { getMobileAuthToken } from '../skynet/Square';

import { hashSecureString } from '../aven-cloud-utils/Crypto';
import EmailAgent from '../aven-email-agent-sendgrid/EmailAgent';
import SMSAgent from '../aven-sms-agent-twilio/SMSAgent';
import SMSAuthMethod from '../aven-cloud-auth-sms/SMSAuthMethod';
import EmailAuthMethod from '../aven-cloud-auth-email/EmailAuthMethod';
import RootAuthMethod from '../aven-cloud-auth-root/RootAuthMethod';
import CloudAuth from '../aven-cloud-auth/CloudAuth';

import startKitchen, { computeKitchenConfig } from './startKitchen';
import { getConnectionToken, capturePayment } from './Stripe';

const getEnv = c => process.env[c];

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const ROOT_PASSWORD = getEnv('ONO_ROOT_PASSWORD');

function extractKitchenConfig() {}

function startTestKitchen({ cloud }) {
  const state = cloud.get('KitchenState');

  function dispatchCommand(action) {
    const { subsystem, pulse, values } = action;
  }

  return { dispatchCommand };
}

const runServer = async () => {
  console.log('☁️ Starting Restaurant Server 💨 ' + process.cwd() + '/db');

  // const dataSource = await startSQLDataSource({
  //   client: 'sqlite3', // must have sqlite3 in the dependencies of this module.
  //   connection: {
  //     filename: 'cloud.sqlite',
  //   },
  // });
  const dataSource = await startFSDataSource({
    domain: 'onofood.co',
    dataDir: process.cwd() + '/db',
  });

  const cloud = createCloudClient({
    dataSource: dataSource,
    domain: 'onofood.co',
  });

  const emailAgent = EmailAgent({
    defaultFromEmail: 'Ono Blends <aloha@onofood.co>',
    config: {
      sendgridAPIKey: getEnv('SENDGRID_API_KEY'),
    },
  });

  const smsAgent = SMSAgent({
    defaultFromNumber: getEnv('TWILIO_FROM_NUMBER'),
    config: {
      accountSid: getEnv('TWILIO_ACCOUNT_SID'),
      authToken: getEnv('TWILIO_AUTH_TOKEN'),
    },
  });

  const smsAuthMethod = SMSAuthMethod({
    agent: smsAgent,
    getMessage: (authCode, verifyInfo, accountId) => {
      if (verifyInfo.context === 'AppUpsell') {
        return `Welcome to Ono Blends. For a free Blend on your next visit, get the app here: https://onofood.co/app?v=${authCode}&a=${accountId}`;
      }
      return `ono authentication: ${authCode}`;
    },
  });

  const emailAuthMethod = EmailAuthMethod({
    agent: emailAgent,
    getMessage: async (authCode, verifyInfo, accountId) => {
      const subject = 'Welcome to Ono Blends';

      const message = `To log in, your code is ${authCode}`;

      return { subject, message };
    },
  });

  const rootAuthMethod = RootAuthMethod({
    rootPasswordHash: await hashSecureString(ROOT_PASSWORD),
  });
  const authenticatedDataSource = CloudAuth({
    dataSource,
    methods: [smsAuthMethod, emailAuthMethod, rootAuthMethod],
  });

  const rootAuth = {
    accountId: 'root',
    verificationInfo: {},
    verificationResponse: { password: ROOT_PASSWORD },
  };

  async function putPermission({ name, defaultRule }) {
    await authenticatedDataSource.dispatch({
      domain: 'onofood.co',
      type: 'PutPermissionRules',
      auth: rootAuth,
      defaultRule,
      name,
    });
  }

  await putPermission({
    defaultRule: { canRead: true },
    name: 'Airtable',
  });

  await putPermission({
    defaultRule: { canRead: true },
    name: 'KitchenConfig',
  });

  await putPermission({
    defaultRule: { canRead: true },
    name: 'KitchenState',
  });

  await putPermission({
    defaultRule: { canPost: true },
    name: 'Orders',
  });

  await putPermission({
    defaultRule: { canWrite: true },
    name: 'PendingOrder',
  });

  await putPermission({
    defaultRule: { canWrite: true },
    name: 'StatusDisplay',
  });

  await putPermission({
    defaultRule: { canWrite: true },
    name: 'StatusDisplay/reducer',
  });

  await putPermission({
    // todo, offer better auth for kiosk state
    defaultRule: { canWrite: true },
    name: 'Kiosk/Left',
  });
  await putPermission({
    // todo, offer better auth for kiosk state
    defaultRule: { canWrite: true },
    name: 'Kiosk/Right',
  });

  const fsClient = createFSClient({ client: cloud });

  const kitchen = startKitchen({
    client: cloud,
    plcIP: '192.168.1.122',
  });

  // const kitchen = startTestKitchen({
  //   cloud,
  // });

  computeKitchenConfig(cloud);

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
  const restaurant = cloud.get('Restaurant');

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

  cloud.get('KitchenState').observeValue.subscribe({
    next: v => {
      kitchenState = v;
      runSideEffects();
    },
  });
  cloud.get('Restaurant').observeValue.subscribe({
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
      case 'StripeGetConnectionToken':
        return getConnectionToken(action);
      case 'StripeCapturePayment':
        return capturePayment(action);
      default:
        return await authenticatedDataSource.dispatch(action);
    }
  };

  scrapeAirTable(fsClient)
    .then(() => {
      console.log('Airtable Updated');
    })
    .catch(console.error);

  const serverListenLocation = getEnv('PORT');

  const context = new Map();

  // const avenClient = createCloudClient(networkDataSource);

  context.set(CloudContext, cloud); // bad idea, must have independent client for authentication!!!
  const webService = await WebServer({
    App,
    context,
    dataSource: {
      ...authenticatedDataSource,
      dispatch,
    },
    serverListenLocation,
  });
  console.log('☁️️ Web Ready 🕸');

  return {
    close: async () => {
      await authenticatedDataSource.close();
      await dataSource.close();
      await webService.close();
      await kitchen.close();
      console.log('😵 Server Closed');
    },
  };
};

export default runServer;
