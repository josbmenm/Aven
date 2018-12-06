import App from './App';
import WebServer from '../aven-web/WebServer';
import { getSecretConfig, IS_DEV } from '../aven-web/config';
import startSQLDataSource from '../aven-cloud-sql/startSQLDataSource';
// import startMemoryDataSource from '../aven-cloud/startMemoryDataSource';
import scrapeAirTable from './scrapeAirTable';
import createCloudClient from '../aven-cloud/createCloudClient';
import createFSClient from '../aven-cloud-server/createFSClient';
import OnoCloudContext from '../ono-cloud/OnoCloudContext';
import { getMobileAuthToken } from './Square';

import { hashSecureString } from '../aven-cloud-utils/Crypto';
import EmailAgent from '../aven-email-agent-sendgrid/EmailAgent';
import SMSAgent from '../aven-sms-agent-twilio/SMSAgent';
import SMSAuthMethod from '../aven-cloud-auth-sms/SMSAuthMethod';
import EmailAuthMethod from '../aven-cloud-auth-email/EmailAuthMethod';
import RootAuthMethod from '../aven-cloud-auth-root/RootAuthMethod';
import CloudAuth from '../aven-cloud-auth/CloudAuth';

const getEnv = c => process.env[c];

const ONO_ROOT_PASSWORD = getEnv('ONO_ROOT_PASSWORD');

const runServer = async () => {
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

  const dataSource = await startSQLDataSource({
    config: {
      client: 'pg', // must have pg in the dependencies of this module.
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
    rootPasswordHash: await hashSecureString(ONO_ROOT_PASSWORD),
  });
  const authenticatedDataSource = CloudAuth({
    dataSource,
    methods: [smsAuthMethod, emailAuthMethod, rootAuthMethod],
  });

  const dataClient = createCloudClient({
    dataSource,
    domain,
  });

  const fsClient = createFSClient({ client: dataClient });

  const context = new Map();
  context.set(OnoCloudContext, dataClient);

  const dispatch = async action => {
    switch (action.type) {
      case 'GetSquareMobileAuthToken':
        return await getMobileAuthToken(action);
      case 'UpdateAirtable':
        return await scrapeAirTable(fsClient);
      case 'Debug':
        return { message: 'The cake is a lie.' };
      default:
        return await authenticatedDataSource.dispatch(action);
    }
  };

  const serverListenLocation = getEnv('PORT');
  const webService = await WebServer({
    context,
    mainDomain: domain,
    App,
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
    },
  };
};

export default runServer;
