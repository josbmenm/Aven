import App from './App';
import WebServer from '../aven-web/WebServer';
import startPostgresStorageSource from '../cloud-postgres/startPostgresStorageSource';
// import createNodeNetworkSource from '../cloud-server/createNodeNetworkSource';
import createCloudClient from '../cloud-core/createCloudClient';
import createFSClient from '../cloud-server/createFSClient';
import CloudContext from '../cloud-core/CloudContext';
import { getSecretConfig, IS_DEV } from '../aven-web/config';
import { createReducerLambda } from '../cloud-core/useCloudReducer';
import KitchenCommands from '../logic/KitchenCommands';
import { hashSecureString } from '../cloud-utils/Crypto';
import EmailAgent from '../email-agent-sendgrid/EmailAgent';
import SMSAgent from '../sms-agent-twilio/SMSAgent';
import SMSAuthProvider from '../cloud-auth-sms/SMSAuthProvider';
import EmailAuthProvider from '../cloud-auth-email/EmailAuthProvider';
import createEvalSource from '../cloud-core/createEvalSource';
import RootAuthProvider from '../cloud-auth-root/RootAuthProvider';
import createNodeNetworkSource from '../cloud-server/createNodeNetworkSource';
import combineSources from '../cloud-core/combineSources';
import createProtectedSource from '../cloud-auth/createProtectedSource';
import authenticateSource from '../cloud-core/authenticateSource';
import InventoryFn from './InventoryFn';
import MenuFn from './MenuFn';
import RestaurantReducer from '../logic/RestaurantReducer';
import placeOrder from './placeOrder';
import { computeInventory } from './KitchenInventory';

import startKitchen, { getFreshActionId } from './startKitchen';
import { handleStripeAction, getPaymentIntent } from '../stripe-server/Stripe';
import { computeNextSteps } from '../logic/KitchenSequence';
import {
  companyConfigToBlendMenu,
  getOrderSummary,
  displayNameOfOrderItem,
  getSelectedIngredients,
} from '../logic/configLogic';

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
  // USE_DEV_SERVER = false;

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
  const storageSource = await startPostgresStorageSource({
    domains: ['onofood.co'],
    config: {
      client: 'pg',
      connection: pgConfig,
    },
  });

  const combinedStorageSource = combineSources({
    fastSource: storageSource,
    slowSource: authenticatedRemoteSource,
    fastSourceOnlyMapping: {
      'onofood.co': {
        KitchenState: true,
      },
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

  const rootAuth = {
    accountId: 'root',
    verificationInfo: {},
    verificationResponse: { password: ROOT_PASSWORD },
  };

  const evalSource = createEvalSource({
    session: rootAuth,
    source: combinedStorageSource,
    domain: 'onofood.co',
    functions: [RestaurantReducer, InventoryFn, MenuFn],
  });

  const protectedSource = createProtectedSource({
    source: evalSource,
    providers: [smsAuthProvider, emailAuthProvider, rootAuthProvider],
  });

  async function putPermission({ name, defaultRule }) {
    await protectedSource.dispatch({
      domain: 'onofood.co',
      type: 'PutPermissionRules',
      auth: rootAuth,
      defaultRule,
      name,
    });
  }

  async function establishPermissions() {
    await putPermission({
      defaultRule: { canRead: true },
      name: 'KitchenState',
    });
    await putPermission({
      defaultRule: { canRead: true },
      name: 'OnoState^Inventory',
    });
    await putPermission({
      defaultRule: { canRead: true },
      name: 'OnoState^Menu',
    });
  }

  computeInventory(evalSource.cloud);

  establishPermissions()
    .then(() => {
      console.log('Permissions Applied');
    })
    .catch(console.error);

  // const fsClient = createFSClient({ client: cloud });
  // await new Promise(resolve => setTimeout(resolve, 3000));

  let kitchen = null;
  if (!process.env.DISABLE_ONO_KITCHEN) {
    kitchen = startKitchen({
      logBehavior,
      client: evalSource.cloud,
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
      let sub = evalSource.cloud.get('KitchenState').observeValue.subscribe({
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
            sub && sub.unsubscribe();
            if (noFaults === false) {
              reject(new Error(`System "${subsystem}" has faulted`));
            } else {
              resolve();
            }
          }
        },
        error: reject,
      });
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

  let restaurantState = null;
  let kitchenState = null;
  let kitchenConfig = null;
  let currentStepPromises = {};

  function handleStateUpdates() {
    if (
      !kitchen ||
      !restaurantState ||
      !kitchenState ||
      !kitchenConfig ||
      !restaurantState.isAutoRunning
    ) {
      return;
    }
    const nextSteps = computeNextSteps(
      restaurantState,
      kitchenConfig,
      kitchenState,
    );
    if (!nextSteps || !nextSteps.length) {
      return;
    }

    nextSteps.forEach(nextStep => {
      const commandType = KitchenCommands[nextStep.command.command];
      const subsystem = commandType.subsystem;
      if (currentStepPromises[subsystem]) {
        return;
      }
      logBehavior(`Performing ${subsystem} ${nextStep.description}`);

      currentStepPromises[subsystem] = nextStep.perform(
        evalSource.cloud,
        kitchenAction,
      );

      currentStepPromises[subsystem]
        .then(() => {
          currentStepPromises[subsystem] = null;
          console.log(`Done with ${nextStep.description}`);
          setTimeout(() => {
            handleStateUpdates();
          }, 50);
        })
        .catch(e => {
          currentStepPromises[subsystem] = null;
          console.error(
            `Failed to perform Kitchen Action: ${
              nextStep.description
            }. JS is basically faulted now??`,
            e,
          );
        });
    });
  }

  evalSource.cloud.get('KitchenState').observeValue.subscribe({
    next: state => {
      kitchenState = state;
      handleStateUpdates();
    },
  });

  evalSource.cloud.get('OnoState^RestaurantConfig').observeValue.subscribe({
    next: state => {
      kitchenConfig = state;
      handleStateUpdates();
    },
  });

  (await evalSource.observeDoc(
    'onofood.co',
    'RestaurantActionsUnburnt^RestaurantReducer',
  )).subscribe({
    next: update => {
      restaurantState = update.value;
      handleStateUpdates();
    },
  });

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
        return placeOrder(evalSource.cloud, action);
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

  context.set(CloudContext, evalSource.cloud); // bad idea, must have independent client for authentication!!!
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
      await combinedStorageSource.close();
      await webService.close();
      kitchen && (await kitchen.close());
      console.log('😵 Server Closed');
    },
  };
};

export default startVerseServer;
