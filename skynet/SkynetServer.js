import App from './SkynetApp';
import WebServer from '../aven-web/WebServer';
import { IS_DEV } from '../aven-web/config';
import startPostgresStorageSource from '../cloud-postgres/startPostgresStorageSource';
import scrapeAirTable from './scrapeAirTable';
import { createClient } from '../cloud-core/Kite';
import { CloudContext } from '../cloud-core/KiteReact';
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
import submitFeedback from './submitFeedback';
import validatePromoCode from './validatePromoCode';
import { HostContext } from '../components/AirtableImage';
import { companyConfigToKitchenConfig } from '../logic/KitchenLogic';
import { companyConfigToMenu } from '../logic/configLogic';
import xs from 'xstream';

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

  const kiteSource = createClient({
    source: storageSource,
    domain: 'onofood.co',
  });
  const airtableFolder = kiteSource.docs.get('Airtable');
  const companyConfig = kiteSource.docs.setOverrideStream(
    'CompanyConfig',
    airtableFolder.value.stream
      .map(folder => {
        if (!folder) {
          return xs.of(null);
        }
        const blockId = folder.files['db.json'].id;
        const block = airtableFolder.getBlock(blockId);
        return block.value.stream;
      })
      .flatten(),
  );
  const kitchenConfig = kiteSource.docs.setOverrideStream(
    'KitchenConfig',
    companyConfig.value.stream.map(companyConfigToKitchenConfig),
  );

  const menu = kiteSource.docs.setOverrideStream(
    'Menu',
    companyConfig.value.stream.map(companyConfigToMenu),
  );
  const logger = createLogger(storageSource, 'onofood.co', 'SkynetEvents');

  const protectedSource = createProtectedSource({
    source: kiteSource,
    staticPermissions: {
      'onofood.co': {
        CompanyConfig: { defaultRule: { canRead: true } },
        KitchenConfig: { defaultRule: { canRead: true } },
        Menu: { defaultRule: { canRead: true } },
        PendingOrders: { defaultRule: { canPost: true } },
        Airtable: { defaultRule: { canRead: true } },
        ConfirmedOrders: { defaultRule: { canRead: true } },
        RequestedLocations: { defaultRule: { canWrite: true } }, // todo, refactor to canTransact!!
        CustomerFeedback: { defaultRule: { canPost: true } },
      },
    },
    providers: [smsAuthProvider, emailAuthProvider, rootAuthProvider],
  });

  const fsClient = createFSClient({ client: kiteSource });

  const context = new Map();
  context.set(CloudContext, kiteSource); // bad idea, must have independent client for authentication!!!
  context.set(HostContext, { authority: 'onofood.co', useSSL: !IS_DEV });

  async function placeOrder({ orderId }, logger) {
    throw new Error('Cannot place order on skynet! Use verse');
  }

  setInterval(
    () => {
      console.log('Updating Airtable..');
      console.log(
        (process.memoryUsage().heapUsed / 1000000).toFixed(2) +
          'MB Memory Consumption',
      );
      scrapeAirTable(fsClient, logger)
        .then(() => {
          console.log('Airtable Update complete!');
          console.log(
            (process.memoryUsage().heapUsed / 1000000).toFixed(2) +
              'MB Memory Consumption',
          );
        })
        .catch(e => {
          console.error('Error Updating Airtable!');
          console.log(
            (process.memoryUsage().heapUsed / 1000000).toFixed(2) +
              'MB Memory Consumption',
          );

          console.error(e);
        });
    },
    10 * 60 * 1000, // 10 minutes
  );

  const dispatch = async action => {
    switch (action.type) {
      case 'SendReceipt':
        return await sendReceipt({
          cloud: kiteSource,
          smsAgent,
          emailAgent,
          action,
          logger,
        });
      case 'RefundOrder': // todo check for root/employee auth. right now this is top secret!
        return await refundOrder({
          cloud: kiteSource,
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
        return validatePromoCode(kiteSource, action, logger);
      case 'SubmitFeedback':
        return submitFeedback(kiteSource, emailAgent, action, logger);
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
      await kiteSource.close();
      await webService.close();
    },
  };
};

export default startSkynetServer;
