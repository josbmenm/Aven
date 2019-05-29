import App from './SkynetApp';
import WebServer from '../aven-web/WebServer';
import { getSecretConfig, IS_DEV } from '../aven-web/config';
import startPostgresStorageSource from '../cloud-postgres/startPostgresStorageSource';
// import createMemoryStorageSource from '../cloud-core/createMemoryStorageSource';
import scrapeAirTable from './scrapeAirTable';
import createCloudClient from '../cloud-core/createCloudClient';
import CloudContext from '../cloud-core/CloudContext';
import createFSClient from '../cloud-server/createFSClient';

import { getConnectionToken, capturePayment } from '../stripe-server/Stripe';

import sendReceipt from './sendReceipt';
import refundOrder from './refundOrder';
import { hashSecureString } from '../cloud-utils/Crypto';
import EmailAgent from '../email-agent-sendgrid/EmailAgent';
import SMSAgent from '../sms-agent-twilio/SMSAgent';
import SMSAuthProvider from '../cloud-auth-sms/SMSAuthProvider';
import EmailAuthProvider from '../cloud-auth-email/EmailAuthProvider';
import RootAuthProvider from '../cloud-auth-root/RootAuthProvider';
import createProtectedSource from '../cloud-auth/createProtectedSource';
import createEvalSource from '../cloud-core/createEvalSource';
import RestaurantReducer from '../logic/RestaurantReducer';
import DevicesReducer from '../logic/DevicesReducer';
import submitFeedback from './submitFeedback';
import validatePromoCode from './validatePromoCode';

import startKitchen, { computeKitchenConfig } from './KitchenConfig';
const getEnv = c => process.env[c];

const ONO_ROOT_PASSWORD = getEnv('ONO_ROOT_PASSWORD');

function createLogger(source, domain, logName) {
  let queue = [];
  let slowTimeout = null;
  let fastTimeout = null;

  function writeLogs() {
    clearTimeout(slowTimeout);
    clearTimeout(fastTimeout);
    if (!queue.length) {
      return;
    }
    const queueSnapshot = queue;
    queue = [];
    source
      .dispatch({
        type: 'PutTransactionValue',
        domain,
        name: logName,
        value: {
          type: 'Logs',
          logs: queueSnapshot,
        },
      })
      .then(() => {
        if (queue.length) {
          enqueueWrite();
        }
      })
      .catch(e => {
        queue = [...queueSnapshot, ...queue];
      });
  }

  function enqueueWrite() {
    if (queue.length > 50) {
      writeLogs();
    } else {
      clearTimeout(fastTimeout);
      slowTimeout = setTimeout(writeLogs, 400);
      fastTimeout = setTimeout(writeLogs, 32);
    }
  }

  function log(message, type, details) {
    queue = [
      ...queue,
      { message, type, details, level: 'log', time: Date.now() },
    ];
    enqueueWrite();
  }
  function warn(message, type, details) {
    queue = [
      ...queue,
      { message, type, details, level: 'warn', time: Date.now() },
    ];
    enqueueWrite();
  }
  function error(message, type, details) {
    queue = [
      ...queue,
      { message, type, details, level: 'error', time: Date.now() },
    ];
    enqueueWrite();
  }

  return {
    log,
    warn,
    error,
  };
}

const startSkynetServer = async () => {
  console.log('☁️ Starting Website 💨');

  const domain = 'onofood.co';
  console.log('☁️ Starting Cloud 💨');

  const pgConfig = {
    ssl: true,
    user: getEnv('SQL_USER'),
    password: getEnv('SQL_PASSWORD'),
    database: getEnv('SQL_DATABASE'),
    host: getEnv('SQL_HOST'),
  };

  console.log('Starting PG connection');
  const storageSource = await startPostgresStorageSource({
    domains: [domain],
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
    rootPasswordHash: await hashSecureString(ONO_ROOT_PASSWORD),
  });

  const evalSource = createEvalSource({
    source: storageSource,
    domain: 'onofood.co',
    functions: [RestaurantReducer, DevicesReducer],
    getValueOfDoc: (docName, cloud) => {
      console.log('getting value of doc', docName);
      return null;
    },
  });

  const logger = createLogger(storageSource, 'onofood.co', 'SkynetEvents');

  const protectedSource = createProtectedSource({
    source: evalSource,
    providers: [smsAuthProvider, emailAuthProvider, rootAuthProvider],
  });

  // const unprotectedCloud = createCloudClient({
  //   source: evalSource,
  //   domain,
  // });

  computeKitchenConfig(evalSource.cloud);

  const fsClient = createFSClient({ client: evalSource.cloud });

  const context = new Map();
  context.set(CloudContext, evalSource.cloud); // bad idea, must have independent client for authentication!!!

  const rootAuth = {
    accountId: 'root',
    verificationInfo: {},
    verificationResponse: { password: ONO_ROOT_PASSWORD },
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

  async function applyPermissions() {
    console.log('Putting Permission.. PendingOrders');
    await putPermission({
      defaultRule: { canPost: true },
      name: 'PendingOrders',
    });

    console.log('Putting Permission.. Airtable');
    await putPermission({
      defaultRule: { canRead: true },
      name: 'Airtable',
    });

    // todo make more restrictive
    await putPermission({
      defaultRule: { canRead: true },
      name: 'ConfirmedOrders',
    });

    await putPermission({
      defaultRule: { canWrite: true },
      name: 'RequestedLocations',
    });

    console.log('Putting Permission.. CustomerFeedback');
    await putPermission({
      defaultRule: { canPost: true },
      name: 'CustomerFeedback',
    });

    console.log('Putting Permission.. OnoState/Devices');
    await putPermission({
      defaultRule: { canWrite: true, canRead: true },
      name: 'OnoState/Devices',
    });

    console.log('Putting Permission.. OnoState/Devices^DevicesReducer');
    await putPermission({
      defaultRule: { canRead: true },
      name: 'OnoState/Devices^DevicesReducer',
    });

    console.log('Putting Permission.. InventoryState');
    await putPermission({
      defaultRule: { canRead: true },
      name: 'InventoryState',
    });

    await putPermission({
      defaultRule: { canRead: true },
      name: 'KitchenConfig',
    });
  }

  applyPermissions()
    .then(() => {
      console.log('Done applying permissions!');
    })
    .catch(console.error);

  async function placeOrder({ orderId }, logger) {
    throw new Error('Cannot place order on skynet! Use verse');
    // console.log('FAIL order..', orderId);

    // const inputOrder = evalSource.cloud.get(`PendingOrders/${orderId}`);
    // await inputOrder.fetchValue();
    // const order = inputOrder.getValue();
    // console.log('placing order..', order);

    // if (!order) {
    //   throw new Error('Could not find order');
    // }

    // await evalSource.cloud.get('OrderActions').putTransaction({
    //   type: 'PlaceOrder',
    //   order,
    // });

    // logger.log('Order Placed', 'PlaceOrder', { orderId });

    return {};
  }

  setInterval(
    () => {
      console.log('Updating Airtable..');
      scrapeAirTable(fsClient, logger)
        .then(() => {
          console.log('Airtable Update complete!');
        })
        .catch(e => {
          console.error('Error Updating Airtable!');
          console.error(e);
        });
    },
    15 * 60 * 1000, // 15 minutes
  );

  const dispatch = async action => {
    switch (action.type) {
      case 'SendReceipt':
        return await sendReceipt({
          cloud: evalSource.cloud,
          smsAgent,
          emailAgent,
          action,
          logger,
        });
      case 'RefundOrder': // todo check for root/employee auth. right now this is top secret!
        return await refundOrder({
          cloud: evalSource.cloud,
          smsAgent,
          emailAgent,
          action,
          logger,
        });
      case 'PlaceOrder':
        return placeOrder(action, logger);
      case 'StripeGetConnectionToken':
        return getConnectionToken(action);
      case 'StripeCapturePayment':
        return capturePayment(action);
      case 'ValidatePromoCode':
        return validatePromoCode(evalSource.cloud, action, logger);
      case 'SubmitFeedback':
        return submitFeedback(evalSource.cloud, emailAgent, action, logger);
      case 'UpdateAirtable': {
        scrapeAirTable(fsClient, logger)
          .then(() => {
            console.log('Done with user-requested Airtable update');
          })
          .catch(e => {
            console.error('Error updating Airtable!', e);
          });
        return {};
      }
      default:
        return await protectedSource.dispatch(action);
    }
  };

  const serverListenLocation = getEnv('PORT');
  const webService = await WebServer({
    context,
    mainDomain: domain,
    App,
    source: {
      ...protectedSource,
      dispatch,
    },
    serverListenLocation,
    assets: require(process.env.RAZZLE_ASSETS_MANIFEST),
    onLogEvent: (level, message) => {
      console.log(level + '=' + message);
    },
  });
  console.log('☁️️ Web Ready 🕸');

  return {
    close: async () => {
      await protectedSource.close();
      await evalSource.close();
      await webService.close();
    },
  };
};

export default startSkynetServer;
