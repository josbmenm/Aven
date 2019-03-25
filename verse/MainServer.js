import App from './App';
import WebServer from '../aven-web/WebServer';
import startFSStorageSource from '../cloud-fs/startFSStorageSource';
// import createNodeNetworkSource from '../cloud-server/createNodeNetworkSource';
import createCloudClient from '../cloud-core/createCloudClient';
import createFSClient from '../cloud-server/createFSClient';
import CloudContext from '../cloud-core/CloudContext';
import { getSecretConfig, IS_DEV } from '../aven-web/config';
import scrapeAirTable from '../skynet/scrapeAirTable';
import { getMobileAuthToken } from '../skynet/Square';

import { hashSecureString } from '../cloud-utils/Crypto';
import EmailAgent from '../email-agent-sendgrid/EmailAgent';
import SMSAgent from '../sms-agent-twilio/SMSAgent';
import SMSAuthProvider from '../cloud-auth-sms/SMSAuthProvider';
import EmailAuthProvider from '../cloud-auth-email/EmailAuthProvider';
import RootAuthProvider from '../cloud-auth-root/RootAuthProvider';
import CloudAuth from '../cloud-auth/CloudAuth';

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

  // const storageSource = await startPostgresStorageSource({
  //   client: 'sqlite3', // must have sqlite3 in the dependencies of this module.
  //   connection: {
  //     filename: 'cloud.sqlite',
  //   },
  // });
  const storageSource = await startFSStorageSource({
    domain: 'onofood.co',
    dataDir: process.cwd() + '/db',
  });

  const cloud = createCloudClient({
    source: storageSource,
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

  const smsAuthProvider = SMSAuthProvider({
    agent: smsAgent,
    getMessage: (authCode, verifyInfo, accountId) => {
      if (verifyInfo.context === 'AppUpsell') {
        return `Welcome to Ono Blends. For a free Blend on your next visit, get the app here: https://onofood.co/app?v=${authCode}&a=${accountId}`;
      }
      return `ono authentication: ${authCode}`;
    },
  });

  const emailAuthProvider = EmailAuthProvider({
    agent: emailAgent,
    getMessage: async (authCode, verifyInfo, accountId) => {
      const subject = 'Welcome to Ono Blends';

      const message = `To log in, your code is ${authCode}`;

      return { subject, message };
    },
  });

  const rootAuthProvider = RootAuthProvider({
    rootPasswordHash: await hashSecureString(ROOT_PASSWORD),
  });
  const protectedSource = CloudAuth({
    source: storageSource,
    providers: [smsAuthProvider, emailAuthProvider, rootAuthProvider],
  });

  const rootAuth = {
    accountId: 'root',
    verificationInfo: {},
    verificationResponse: { password: ROOT_PASSWORD },
  };

  async function putPermission({ name, defaultRule }) {
    await protectedSource.dispatch({
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
    name: 'RestaurantState',
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
        return await protectedSource.dispatch(action);
    }
  };

  scrapeAirTable(fsClient)
    .then(() => {
      console.log('Airtable Updated');
    })
    .catch(console.error);

  const serverListenLocation = getEnv('PORT');

  const context = new Map();

  context.set(CloudContext, cloud); // bad idea, must have independent client for authentication!!!
  const webService = await WebServer({
    App,
    context,
    source: {
      ...protectedSource,
      dispatch,
    },
    serverListenLocation,
  });
  console.log('☁️️ Web Ready 🕸');

  return {
    close: async () => {
      await protectedSource.close();
      await storageSource.close();
      await webService.close();
      await kitchen.close();
      console.log('😵 Server Closed');
    },
  };
};

export default runServer;
