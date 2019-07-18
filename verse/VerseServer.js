import App from './App';
import WebServer from '../aven-web/WebServer';
import startPostgresStorageSource from '../cloud-postgres/startPostgresStorageSource';
import { CloudContext, createReducerStream } from '../cloud-core/KiteReact';
import { getFreshActionId } from '../logic/KitchenLogic';
import RestaurantReducer from '../logic/RestaurantReducer';
import KitchenCommands from '../logic/KitchenCommands';
import { hashSecureString } from '../cloud-utils/Crypto';
import EmailAgent from '../email-agent-sendgrid/EmailAgent';
import SMSAgent from '../sms-agent-twilio/SMSAgent';
import SMSAuthProvider from '../cloud-auth-sms/SMSAuthProvider';
import EmailAuthProvider from '../cloud-auth-email/EmailAuthProvider';
import { createClient } from '../cloud-core/Kite';
import RootAuthProvider from '../cloud-auth-root/RootAuthProvider';
import createNodeNetworkSource from '../cloud-server/createNodeNetworkSource';
import combineSources from '../cloud-core/combineSources';
import createProtectedSource from '../cloud-auth/createProtectedSource';
import authenticateSource from '../cloud-core/authenticateSource';
import placeOrder from './placeOrder';

import startKitchen from './startKitchen';
import { handleStripeAction } from '../stripe-server/Stripe';
import { computeNextSteps } from '../logic/KitchenSequence';

let lastT = null;
function logBehavior(msg) {
  const t = Date.now();
  let outMsg = `${t} `;
  if (lastT) {
    const deltaT = t - lastT;
    outMsg += `(${deltaT} ms since last) `;
  }
  outMsg += ' - ' + msg;
  lastT = t;
  console.log(outMsg);
}

const getEnv = c => process.env[c];

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const ROOT_PASSWORD = getEnv('ONO_ROOT_PASSWORD');

const startVerseServer = async () => {
  console.log(`☁️ Starting Restaurant Server in ${process.env.NODE_ENV} 💨 `);

  const pgConfig = {
    ssl: !!getEnv('VERSE_SQL_USE_SSL'),
    user: getEnv('VERSE_SQL_USER'),
    password: getEnv('VERSE_SQL_PASSWORD'),
    database: getEnv('VERSE_SQL_DATABASE'),
    host: getEnv('VERSE_SQL_HOST'),
  };

  let USE_DEV_SERVER = process.env.NODE_ENV !== 'production';
  USE_DEV_SERVER = false;

  const remoteNetworkConfig = USE_DEV_SERVER
    ? {
        authority: 'localhost:8840',
        useSSL: false,
      }
    : {
        authority: 'onofood.co',
        useSSL: true,
      };

  const remoteSource = createNodeNetworkSource({
    ...remoteNetworkConfig,
    quiet: true,
  });

  const authenticatedRemoteSource = authenticateSource(
    remoteSource,
    'onofood.co',
    {
      accountId: 'root',
      verificationInfo: {},
      verificationResponse: { password: ROOT_PASSWORD }, // careful! here we assume that skynet's root pw is the same as the one here for verse!
    },
  );
  // const storageSource = await startPostgresStorageSource({
  //   domains: ['onofood.co'],
  //   config: {
  //     client: 'pg',
  //     connection: pgConfig,
  //   },
  // });

  // const combinedStorageSource = combineSources({
  //   fastSource: storageSource,
  //   slowSource: authenticatedRemoteSource,
  //   fastSourceOnlyMapping: {
  //     'onofood.co': {
  //       KitchenState: true,
  //     },
  //   },
  // });

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

  const rootAuth = {
    accountId: 'root',
    verificationInfo: {},
    verificationResponse: { password: ROOT_PASSWORD },
  };

  const cloud = createClient({
    auth: rootAuth,
    source: authenticatedRemoteSource,
    // source: remoteSource,
    domain: 'onofood.co',
    // functions: [RestaurantReducer, InventoryFn, MenuFn],
  });

  cloud.get('KitchenState').setLocalOnly();

  const restaurantActions = cloud.get('RestaurantActions');

  const restaurantState = cloud.docs.setOverrideStream(
    'RestaurantState',
    createReducerStream(
      restaurantActions,
      RestaurantReducer.reducerFn,
      RestaurantReducer.initialState,
    ),
  );

  const protectedSource = createProtectedSource({
    source: cloud,
    staticPermissions: {
      'onofood.co': {
        KitchenState: { defaultRule: { canRead: true } },
        KitchenConfig: { defaultRule: { canRead: true } },
        RestaurantActions: { defaultRule: { canRead: true } },
        RestaurantState: { defaultRule: { canRead: true } },
        // 'OnoState^Inventory': { defaultRule: { canRead: true } },
        // 'OnoState^Menu': { defaultRule: { canRead: true } },
        // 'RestaurantActions^RestaurantReducer': {
        //   defaultRule: { canRead: true },
        // },
      },
    },
    providers: [smsAuthProvider, emailAuthProvider, rootAuthProvider],
  });

  let kitchen = null;
  if (!process.env.DISABLE_ONO_KITCHEN) {
    console.log('Connecting to Maui Kitchen');
    kitchen = startKitchen({
      logBehavior,
      cloud,
      plcIP: '192.168.1.122',
    });
  }

  async function kitchenAction(action) {
    if (!kitchen) {
      throw new Error('No kitchen right now');
    }
    const commandType = KitchenCommands[action.command];

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
    const actionId = getFreshActionId();
    logBehavior(`Start Action ${actionId} : ${JSON.stringify(action)}`);

    const command = {
      actionId,
      type: 'KitchenCommand',
      subsystem,
      pulse,
      values,
    };
    kitchen.dispatchCommand(command);
    await new Promise((resolve, reject) => {
      let isSystemIdle = null;
      let isActionReceived = null;
      let isActionComplete = null;
      let currentActionId = null;
      let endedActionId = null;
      let noFaults = true;
      const stateValue = cloud.get('KitchenState').value.stream;

      const stateListener = {
        next: state => {
          if (!state) {
            return;
          }
          noFaults = state[`${subsystem}_NoFaults_READ`];
          currentActionId = state[`${subsystem}_ActionIdStarted_READ`];
          endedActionId = state[`${subsystem}_ActionIdEnded_READ`];
          isSystemIdle = state[`${subsystem}_PrgStep_READ`] === 0;
          isActionReceived = currentActionId === actionId;
          isActionComplete = endedActionId === actionId;

          if (isActionReceived && (isSystemIdle || isActionComplete)) {
            logBehavior(`${noFaults ? 'Done with' : 'FAULTED on'} ${actionId}`);
            stateValue.removeListener(stateListener);
            if (noFaults === false) {
              reject(new Error(`System "${subsystem}" has faulted`));
            } else {
              resolve();
            }
          }
        },
        error: reject,
      };

      stateValue.addListener(stateListener);

      // setTimeout(() => {
      //   sub && sub.unsubscribe();
      //   if (!isSystemIdle) {
      //     return reject(new Error(`After 30sec, "${subsystem}" is not idle!`));
      //   }
      //   if (!isActionReceived) {
      //     return reject(
      //       new Error(
      //         `After 90sec, ActionIdEnded of "${subsystem}" is "${currentActionId}" but we expected "${actionId}"!`,
      //       ),
      //     );
      //   }
      //   reject(new Error('Unknown timeout waiting for kitchen state..'));
      // }, 90000);
    });
    return command;
  }

  // let restaurantState = null;
  // let kitchenState = null;
  // let kitchenConfig = null;
  // let currentStepPromises = {};

  // function handleStateUpdates() {
  //   if (
  //     !restaurantState ||
  //     !kitchenState ||
  //     !kitchenConfig ||
  //     !restaurantState.isAutoRunning
  //   ) {
  //     return;
  //   }
  //   const nextSteps = computeNextSteps(
  //     restaurantState,
  //     kitchenConfig,
  //     kitchenState,
  //   );
  //   if (!nextSteps || !nextSteps.length) {
  //     return;
  //   }

  //   nextSteps.forEach(nextStep => {
  //     const commandType = KitchenCommands[nextStep.command.command];
  //     const subsystem = commandType.subsystem;
  //     if (currentStepPromises[subsystem]) {
  //       return;
  //     }

  //     if (restaurantState.isAttached) {
  //       if (!kitchen || !kitchenState.isPLCConnected) {
  //         return;
  //       }
  //       logBehavior(`Performing ${subsystem} ${nextStep.description}`);
  //       currentStepPromises[subsystem] = nextStep.perform(cloud, kitchenAction);
  //     } else {
  //       logBehavior(`Detached Action: ${subsystem} ${nextStep.description}`);
  //       currentStepPromises[subsystem] = new Promise(resolve =>
  //         setTimeout(resolve, 2000),
  //       )
  //         .then(() =>
  //           cloud
  //             .get('RestaurantActions')
  //             .putTransaction(nextStep.successRestaurantAction),
  //         )
  //         .then(() => {
  //           console.log('Done with detached auto-run');
  //         });
  //     }

  //     currentStepPromises[subsystem]
  //       .then(() => {
  //         currentStepPromises[subsystem] = null;
  //         console.log(`Done with ${nextStep.description}`);
  //         setTimeout(() => {
  //           handleStateUpdates();
  //         }, 50);
  //       })
  //       .catch(e => {
  //         currentStepPromises[subsystem] = null;
  //         console.error(
  //           `Failed to perform Kitchen Action: ${
  //             nextStep.description
  //           }. JS is basically faulted now??`,
  //           e,
  //         );
  //       });
  //   });
  // }

  // // you poor thing...

  // cloud.get('KitchenState').observeValue.subscribe({
  //   next: state => {
  //     kitchenState = state;
  //     handleStateUpdates();
  //   },
  // });
  // cloud.get('OnoState^RestaurantConfig').observeValue.subscribe({
  //   next: state => {
  //     kitchenConfig = state;
  //     handleStateUpdates();
  //   },
  // });
  // (await evalSource.observeDoc(
  //   'onofood.co',
  //   'RestaurantActions^RestaurantReducer',
  // )).subscribe({
  //   next: update => {
  //     restaurantState = update.value;
  //     handleStateUpdates();
  //   },
  //   error: err => {
  //     console.error('........,,.Woah WTFZ', err);
  //   },
  // });

  const dispatch = async action => {
    let stripeResponse = await handleStripeAction(action);
    if (stripeResponse) {
      return stripeResponse;
    }
    switch (action.type) {
      case 'KitchenCommand': {
        // low level thing
        if (!kitchen) {
          throw new Error('no kitchen');
        }
        // subsystem (eg 'IOSystem'), pulse (eg ['home']), values (eg: foo: 123)
        const actionId = getFreshActionId();
        return await kitchen.dispatchCommand({ ...action, actionId });
      }
      case 'KitchenAction':
        return await kitchenAction(action);
      case 'PlaceOrder':
        return placeOrder(cloud, action);
      default: {
        return await protectedSource.dispatch(action);
      }
    }
  };

  if (process.env.TEST_VERSE) {
    console.log('VERSE TEST RUNNING?');
  }

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
      await cloud.close();
      await webService.close();
      kitchen && (await kitchen.close());
      console.log('😵 Server Closed');
    },
  };
};

export default startVerseServer;
