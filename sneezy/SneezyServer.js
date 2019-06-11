import App from './SneezyApp';
import WebServer from '../aven-web/WebServer';
import { getSecretConfig, IS_DEV } from '../aven-web/config';
import startPostgresStorageSource from '../cloud-postgres/startPostgresStorageSource';
// import createMemoryStorageSource from '../cloud-core/createMemoryStorageSource';
import scrapeAirTable from './scrapeAirTable';
import createCloudClient from '../cloud-core/createCloudClient';
import CloudContext from '../cloud-core/CloudContext';
import createNodeNetworkSource from '../cloud-server/createNodeNetworkSource';

import { getConnectionToken, capturePayment } from '../stripe-server/Stripe';

import sendReceipt from './sendReceipt';
import refundOrder from './refundOrder';
import { hashSecureString } from '../cloud-utils/Crypto';
import EmailAgent from '../email-agent-sendgrid/EmailAgent';
import SMSAgent from '../sms-agent-twilio/SMSAgent';
import SMSAuthProvider from '../cloud-auth-sms/SMSAuthProvider';
import EmailAuthProvider from '../cloud-auth-email/EmailAuthProvider';
import RootAuthProvider from '../cloud-auth-root/RootAuthProvider';
import createEvalSource from '../cloud-core/createEvalSource';
import RestaurantReducer from '../logic/RestaurantReducer';
import RestaurantConfig from './RestaurantConfig';
import CompanyConfigFn from './CompanyConfigFn';
import DevicesReducer from '../logic/DevicesReducer';
import validatePromoCode from './validatePromoCode';
import { HostContext } from '../components/AirtableImage';

const getEnv = c => process.env[c];

const ONO_ROOT_PASSWORD = getEnv('ONO_ROOT_PASSWORD');

const startSkynetServer = async () => {
  console.log('☁️ Starting Website 💨');

  const domain = 'onofood.co';
  console.log('☁️ Starting Sneezy 💨');

  console.log('Starting Node Network connection');
  const networkSource = await createNodeNetworkSource({
    authority: 'onofood.co',
    useSSL: true,
  });

  const cloud = createCloudClient({
    source: [networkSource],
    domain: 'onofood.co',
  });

  const context = new Map();
  context.set(CloudContext, cloud);
  context.set(HostContext, { authority: 'onofood.co', useSSL: !IS_DEV });

  const dispatch = async action => {
    switch (action.type) {
      default:
        return await networkSource.dispatch(action);
    }
  };

  const serverListenLocation = getEnv('PORT');
  const webService = await WebServer({
    context,
    mainDomain: domain,
    App,
    source: {
      ...networkSource,
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
      await networkSource.close();
      await webService.close();
    },
  };
};

export default startSkynetServer;
