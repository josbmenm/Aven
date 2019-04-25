import App from './App';
import WebServer from '../aven-web/WebServer';
import startPostgresStorageSource from '../cloud-postgres/startPostgresStorageSource';
// import createNodeNetworkSource from '../cloud-server/createNodeNetworkSource';
import createCloudClient from '../cloud-core/createCloudClient';
import createFSClient from '../cloud-server/createFSClient';
import CloudContext from '../cloud-core/CloudContext';
import { getSecretConfig, IS_DEV } from '../aven-web/config';
import scrapeAirTable from '../skynet/scrapeAirTable';
import { getMobileAuthToken } from '../skynet/Square';
import { createReducerLambda } from '../cloud-core/useCloudReducer';
import KitchenCommands from '../logic/KitchenCommands';
import { hashSecureString } from '../cloud-utils/Crypto';
import EmailAgent from '../email-agent-sendgrid/EmailAgent';
import SMSAgent from '../sms-agent-twilio/SMSAgent';
import SMSAuthProvider from '../cloud-auth-sms/SMSAuthProvider';
import EmailAuthProvider from '../cloud-auth-email/EmailAuthProvider';
import createEvalSource from '../cloud-core/createEvalSource';
import RootAuthProvider from '../cloud-auth-root/RootAuthProvider';
import createProtectedSource from '../cloud-auth/createProtectedSource';
import sendReceipt from './sendReceipt';
import RestaurantReducer from '../logic/RestaurantReducer';

import startKitchen, { computeKitchenConfig } from './startKitchen';
import { getConnectionToken, capturePayment } from './Stripe';
import { computeNextStep } from '../logic/KitchenSequence';

const COUNT_MAX = 2147483640; // near the maximum unsigned dint

let tagCounter = Math.floor(Math.random() * COUNT_MAX);

function getFreshTag() {
  tagCounter += 1;
  if (tagCounter > COUNT_MAX) {
    tagCounter = 0;
  }
  return tagCounter;
}

const getEnv = c => process.env[c];

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const ROOT_PASSWORD = getEnv('ONO_ROOT_PASSWORD');

const runServer = async () => {
  console.log('☁️ Starting Restaurant Server 💨 ');

  const pgConfig = {
    ssl: !!getEnv('SQL_USE_SSL'),
    user: getEnv('SQL_USER'),
    password: getEnv('SQL_PASSWORD'),
    database: getEnv('SQL_DATABASE'),
    host: getEnv('SQL_HOST'),
  };

  const storageSource = await startPostgresStorageSource({
    domains: ['onofood.co'],
    config: {
      client: 'pg',
      connection: pgConfig,
    },
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

  const evalSource = createEvalSource({
    source: storageSource,
    domain: 'onofood.co',
    functions: [RestaurantReducer],
  });

  const cloud = createCloudClient({
    source: evalSource,
    domain: 'onofood.co',
  });

  const protectedSource = createProtectedSource({
    source: evalSource,
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
    defaultRule: { canWrite: true, canRead: true },
    name: 'RestaurantActions',
  });

  await putPermission({
    defaultRule: { canWrite: true, canRead: true },
    name: 'RestaurantReducer',
  });

  await putPermission({
    defaultRule: { canRead: true },
    name: 'RestaurantActions^RestaurantReducer',
  });

  await putPermission({
    defaultRule: { canRead: true },
    name: 'RestaurantSequencer',
  });

  await putPermission({
    defaultRule: { canRead: true },
    name: 'KitchenState',
  });

  await putPermission({
    defaultRule: { canRead: true },
    name: 'KitchenConfig',
  });

  await putPermission({
    defaultRule: { canRead: true, canTransact: true },
    name: 'KitchenActions',
  });

  await putPermission({
    defaultRule: { canRead: true, canTransact: true },
    name: 'KitchenLog',
  });

  await putPermission({
    defaultRule: { canPost: true },
    name: 'Orders',
  });

  await putPermission({
    defaultRule: { canWrite: true },
    name: 'Restaurant',
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
  await new Promise(resolve => setTimeout(resolve, 3000));
  computeKitchenConfig(cloud);

  const kitchen = startKitchen({
    client: cloud,
    plcIP: '192.168.1.122',
  });

  // const kitchen = startTestKitchen({
  //   cloud,
  // });

  // function evaluateKitchenState(kitchenState) {
  //   const isFillSystemReady =
  //     kitchenState.FillSystem_PrgStep_READ === 0 &&
  //     kitchenState.FillSystem_NoFaults_READ &&
  //     kitchenState.FillSystem_Homed_READ;
  //   const isReadyToGoToPosition =
  //     kitchenState.FillPositioner_GoToPositionReady_READ;
  //   const isReadyToFill =
  //     isReadyToGoToPosition &&
  //     kitchenState.FillSystem_PositionAndDispenseAmountReady_READ;
  //   return {
  //     isFillSystemReady,
  //     isReadyToGoToPosition,
  //     isReadyToFill,
  //     isReadyToStartOrder: isReadyToFill,
  //     isReadyToDeliver: isReadyToFill,
  //   };
  // }
  // const restaurant = cloud.get('Restaurant');

  // async function runFill({ amount, system, slot }) {
  //   await kitchen.dispatchCommand({
  //     subsystem: 'FillSystem',
  //     pulse: ['PositionAndDispenseAmount'],
  //     values: {
  //       DispenseAmount: amount,
  //       DispenseSystem: system,
  //       SlotToDispense: slot,
  //     },
  //   });
  //   await delay(250);
  // }
  // async function startOrder() {
  //   await kitchen.dispatchCommand({
  //     subsystem: 'FillPositioner',
  //     pulse: ['GoToPosition'],
  //     values: {
  //       PositionDest: 1,
  //     },
  //   });
  //   await delay(2550);
  // }
  // async function runDeliver() {
  //   await kitchen.dispatchCommand({
  //     subsystem: 'FillPositioner',
  //     pulse: ['GoToPosition'],
  //     values: {
  //       PositionDest: 45500,
  //     },
  //   });
  //   await delay(550);
  // }

  async function kitchenAction(action) {
    const commandType = KitchenCommands[action.command];
    console.log('Kitchen Action:', action.command, action.params);

    if (!commandType) {
      throw new Error(`Unknown kitchen command "${action.command}"`);
    }
    const { valueParamNames, pulse, subsystem } = commandType;
    const values = { ...commandType.values };
    valueParamNames &&
      Object.keys(valueParamNames).forEach(valueCommandName => {
        const provided =
          action.params && action.params[valueParamNames[valueCommandName]];
        if (provided != null) {
          values[valueCommandName] = provided;
        }
      });
    const tag = getFreshTag();
    const command = {
      tag,
      type: 'KitchenCommand',
      subsystem,
      pulse,
      values,
    };
    kitchen.dispatchCommand(command);
    await new Promise((resolve, reject) => {
      let sub = cloud.get('KitchenState').observeValue.subscribe({
        next: state => {
          if (!state) {
            return;
          }
          const isSystemIdle = state[`${subsystem}_PrgStep_READ`] === 0;
          const isTagReceived = state[`${subsystem}_TagOut_READ`] === tag;
          if (isSystemIdle && isTagReceived) {
            resolve();
            sub && sub.unsubscribe();
          }
        },
        error: reject,
      });
      setTimeout(() => {
        sub && sub.unsubscribe();
        reject(new Error('Timeout waiting for kitchen state..'));
      }, 15000);
    });
    return command;
  }

  // async function applySideEffects(restaurantState, kitchenState) {
  //   if (!restaurantState || !kitchenState) {
  //     return;
  //   }
  //   const {
  //     isReadyToFill,
  //     isReadyToStartOrder,
  //     isReadyToDeliver,
  //   } = evaluateKitchenState(kitchenState);

  //   const queuedOrders = restaurantState.queuedOrders || [];

  //   if (
  //     isReadyToStartOrder &&
  //     queuedOrders.length &&
  //     restaurantState.fillingOrder == null
  //   ) {
  //     const order = queuedOrders[0];
  //     const nextState = {
  //       ...restaurantState,
  //       queuedOrders: queuedOrders.slice(1),
  //       fills: [
  //         {
  //           amount: 2,
  //           system: 1,
  //           slot: 0,
  //         },
  //         {
  //           amount: 2,
  //           system: 0,
  //           slot: 0,
  //         },
  //       ],
  //       fillingOrder: order,
  //     };
  //     await restaurant.put(nextState);
  //     console.log('starting order!');
  //     await startOrder();
  //     return;
  //   }

  //   if (
  //     restaurantState.fillingOrder &&
  //     isReadyToFill &&
  //     restaurantState.fills.length
  //   ) {
  //     const fillToRun = restaurantState.fills[0];
  //     await restaurant.put({
  //       ...restaurantState,
  //       fills: restaurantState.fills.slice(1),
  //     });
  //     console.log('filling ' + fillToRun.system);
  //     await runFill(fillToRun);
  //     return;
  //   }

  //   if (
  //     restaurantState.fillingOrder &&
  //     !restaurantState.fills.length &&
  //     restaurantState.deliveringOrder == null &&
  //     isReadyToDeliver
  //   ) {
  //     await restaurant.put({
  //       ...restaurantState,
  //       fills: [],
  //       fillingOrder: null,
  //       deliveringOrder: restaurantState.fillingOrder,
  //     });
  //     console.log('delivering ');
  //     await runDeliver();
  //     return;
  //   }

  //   if (restaurantState.deliveringOrder && isReadyToDeliver) {
  //     // fills are complete, move on. right now that means we are done
  //     console.log('order complete!');
  //     await restaurant.put({
  //       ...restaurantState,
  //       fills: [],
  //       deliveringOrder: null,
  //       completeOrders: [
  //         ...(restaurantState.completeOrders || []),
  //         restaurantState.deliveringOrder,
  //       ],
  //     });
  //     return;
  //   }
  // }

  // let effectedRestaurantState = undefined;
  // let effectedKitchenState = undefined;
  // let effectInProgress = null;

  // function runSideEffects() {
  //   if (effectInProgress) {
  //     return;
  //   }
  //   const newRestaurantState = restaurantState;
  //   const newKitchenState = kitchenState;
  //   if (
  //     newRestaurantState !== effectedRestaurantState ||
  //     newKitchenState !== effectedKitchenState
  //   ) {
  //     effectInProgress = true;
  //     // console.log('gogogo', { newRestaurantState, newKitchenState });
  //     applySideEffects(newRestaurantState, newKitchenState)
  //       .then(() => {})
  //       .catch(e => {
  //         console.error(e);
  //       })
  //       .finally(() => {
  //         effectedRestaurantState = newRestaurantState;
  //         effectedKitchenState = newKitchenState;
  //         effectInProgress = false;
  //         runSideEffects();
  //       });
  //   }
  // }

  let restaurantState = null;
  let kitchenState = null;
  let kitchenConfig = null;
  let currentStepPromise = null;

  function handleStateUpdates() {
    if (
      !restaurantState ||
      !kitchenState ||
      !kitchenConfig ||
      !restaurantState.isAutoRunning ||
      currentStepPromise
    ) {
      return;
    }
    const nextStep = computeNextStep(
      restaurantState,
      kitchenConfig,
      kitchenState,
    );
    if (!nextStep) {
      return;
    }
    console.log('Next Step:', nextStep.description);
    currentStepPromise = nextStep.perform(cloud, kitchenAction);

    currentStepPromise
      .then(() => {
        currentStepPromise = null;
        console.log(`Done with ${nextStep.description}`);
        setTimeout(() => {
          handleStateUpdates();
        }, 32);
      })
      .catch(e => {
        currentStepPromise = null;
        console.error(
          `Failed to perform Kitchen Action: ${
            nextStep.description
          }. JS is basically faulted now??`,
          e,
        );
      });
  }

  cloud.get('KitchenState').observeValue.subscribe({
    next: state => {
      kitchenState = state;
      handleStateUpdates();
    },
  });

  cloud.get('KitchenConfig').observeValue.subscribe({
    next: state => {
      kitchenConfig = state;
      handleStateUpdates();
    },
  });

  (await evalSource.observeDoc(
    'onofood.co',
    'RestaurantActions^RestaurantReducer',
  )).subscribe({
    next: update => {
      restaurantState = update.value;
      handleStateUpdates();
    },
  });

  async function placeOrder({ orderId }) {
    console.log('placing order..', orderId);

    const orderResult = await cloud.dispatch({
      type: 'GetDocValue',
      name: `Orders/${orderId}`,
      domain: 'onofood.co',
    });

    const at = cloud.get('Airtable').expand((folder, doc) => {
      if (!folder) {
        return null;
      }
      return doc.getBlock(folder.files['db.json']);
    });
    await at.fetchValue();
    const config = at.getValue();
    // const order = orderResult.value;

    console.log('current order is ', orderResult.items, config);
    // await cloud.get('RestaurantActions').putTransaction({
    //   type: 'PlaceOrder',
    //   order: {
    //     id: currentOrder.getName(),
    //     name:
    //       orderValue.orderName.firstName + ' ' + orderValue.orderName.lastName,
    //     blendName: 'mint chip greens + protein',
    //     fills: [
    //       { system: 5, slot: 0, amount: 1 },
    //       { system: 3, slot: 0, amount: 2 },
    //       { system: 3, slot: 2, amount: 3 },
    //     ],
    //   },
    // });
    return {};
  }

  const dispatch = async action => {
    switch (action.type) {
      case 'KitchenCommand': // low level thing
        // subsystem (eg 'IOSystem'), pulse (eg ['home']), values (eg: foo: 123)
        return await kitchen.dispatchCommand(action);
      case 'SendReceipt':
        return await sendReceipt({ smsAgent, emailAgent, action });
      case 'KitchenAction':
        return await kitchenAction(action);
      case 'UpdateAirtable':
        return await scrapeAirTable(fsClient);
      case 'GetSquareMobileAuthToken':
        return getMobileAuthToken(action);
      case 'StripeGetConnectionToken':
        return getConnectionToken(action);
      case 'StripeCapturePayment':
        return capturePayment(action);
      case 'PlaceOrder':
        return placeOrder(action);
      default:
        return await protectedSource.dispatch(action);
    }
  };

  // scrapeAirTable(fsClient)
  //   .then(() => {
  //     console.log('Airtable Updated');
  //   })
  //   .catch(console.error);

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
    assets: require(process.env.RAZZLE_ASSETS_MANIFEST),
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
