import App from './App';
import WebServer from '../aven-web/WebServer';
import { CloudContext } from '../cloud-core/KiteReact';
import { createReducerStream } from '../cloud-core/Kite';
import RestaurantReducer from '../logic/RestaurantReducer';
import KitchenCommands from '../logic/KitchenCommands';
import { hashSecureString } from '../cloud-utils/Crypto';
import EmailAgent from '../email-agent-sendgrid/EmailAgent';
import SMSAgent from '../sms-agent-twilio/SMSAgent';
import SMSAuthProvider from '../cloud-auth-sms/SMSAuthProvider';
import EmailAuthProvider from '../cloud-auth-email/EmailAuthProvider';
import { createSessionClient } from '../cloud-core/Kite';
import RootAuthProvider from '../cloud-auth-root/RootAuthProvider';
import createNodeNetworkSource from '../cloud-server/createNodeNetworkSource';
import createProtectedSource from '../cloud-auth/createProtectedSource';
import authenticateSource from '../cloud-core/authenticateSource';
import placeOrder from './placeOrder';
import { connectMachine } from './Machine';
import KitchenSteps from '../logic/KitchenSteps';
import { log, error, setLoggerMode } from '../logger/logger';

setLoggerMode(process.env.NODE_ENV === 'production' ? 'json' : 'debug');

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

const ROOT_PASSWORD = getEnv('ONO_ROOT_PASSWORD');

const startVerseServer = async () => {
  log('WillStartServer', { serverType: 'verse' });

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
        authority: 'onoblends.co',
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

  const cloud = createSessionClient({
    auth: rootAuth,
    source: authenticatedRemoteSource,
    domain: 'onofood.co',
  });

  cloud.get('KitchenState').setLocalOnly();
  cloud.get('RestaurantActions').setLocalOnly();
  // cloud.get('RestaurantState').setLocalOnly();

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
        CompanyConfig: { defaultRule: { canRead: true } },
        PendingOrders: { defaultRule: { canPost: true } },

        // 'OnoState^Inventory': { defaultRule: { canRead: true } },
        // 'OnoState^Menu': { defaultRule: { canRead: true } },
        // 'RestaurantActions^RestaurantReducer': {
        //   defaultRule: { canRead: true },
        // },
      },
    },
    providers: [smsAuthProvider, emailAuthProvider, rootAuthProvider],
  });
  const kitchenConfigStream = cloud.get('KitchenConfig').value.stream;

  const kitchenStateDoc = cloud.get('KitchenState');

  let kitchen = null;
  if (!process.env.DISABLE_ONO_KITCHEN) {
    log('ConnectToMachine');
    kitchen = connectMachine({
      commands: KitchenCommands,
      sequencerSteps: KitchenSteps,
      computeSideEffects: (prevKitchenState, kitchenState, restaurantState) => {
        const {
          System_FreezerTemp_READ,
          System_BevTemp_READ,
          System_YogurtZoneTemp_READ,
          Denester_DispensedSinceLow_READ,
        } = kitchenState;
        const foodMonitoring = {
          isBeverageCold: System_BevTemp_READ < 42,
          isFreezerCold: System_FreezerTemp_READ < 42,
          isYogurtCold: System_YogurtZoneTemp_READ < 42,
        };
        const lastMonitoredState = restaurantState.foodMonitoring || {};

        const sideEffects = [];
        if (
          Object.entries(foodMonitoring).find(
            ([monitorKey, monitorValue]) =>
              monitorValue !== lastMonitoredState[monitorKey],
          )
        ) {
          sideEffects.push({ type: 'SetFoodMonitoring', foodMonitoring });
        }

        // if (Denester_DispensedSinceLow_READ && resta) {

        // }
        return sideEffects;
      },
      logBehavior,
      configStream: kitchenConfigStream,
      restaurantStateStream: cloud.get('RestaurantState').value.stream,
      onDispatcherAction: cloud.get('RestaurantActions').putTransactionValue,
      kitchenStateDoc,
      plcIP: '10.10.1.122',
    });
  }

  async function silentDispatch(action) {
    switch (action.type) {
      case 'KitchenCommand':
        if (!kitchen) {
          return;
        }
        return await kitchen.command(action);
      case 'KitchenWriteMachineValues': {
        // low level thing
        if (!kitchen) {
          throw new Error('No Machine');
        }
        // subsystem (eg 'FillSystem'), pulse (eg ['home']), values (eg: foo: 123)
        return await kitchen.writeMachineValues(action);
      }
      case 'PlaceOrder':
        return placeOrder(cloud, action);
      default: {
        return await cloud.dispatch(action);
      }
    }
  }

  async function dispatch(action) {
    try {
      const response = await silentDispatch(action);
      log('DispatchedAction', { action, response });
      return response;
    } catch (e) {
      error('DispatchedAction', { action, error: e });
      throw e;
    }
  }

  const serverListenLocation = getEnv('PORT');

  const context = new Map();

  context.set(CloudContext, cloud); // bad idea, must have independent client for authentication!!!
  const webService = await WebServer({
    App,
    context,
    source: {
      // ...protectedSource,
      ...cloud,
      dispatch,
    },
    serverListenLocation,
    assets: require(process.env.RAZZLE_ASSETS_MANIFEST),
  });

  log('ServerStarted', {
    serverType: 'verse',
    hasKitchen: !!kitchen,
    nodeEnv: process.env.NODE_ENV,
  });

  return {
    close: async () => {
      log('VerseWillClose', {
        hasKitchen: !!kitchen,
        nodeEnv: process.env.NODE_ENV,
      });
      await protectedSource.close();
      await cloud.close();
      await webService.close();
      kitchen && (await kitchen.close());
      console.log('😵 Server Closed');
    },
  };
};

export default startVerseServer;
