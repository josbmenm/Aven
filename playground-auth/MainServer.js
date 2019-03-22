import EmailAuthProvider from '../cloud-auth-email/EmailAuthProvider';
import RootAuthProvider from '../cloud-auth-root/RootAuthProvider';
import SMSAuthProvider from '../cloud-auth-sms/SMSAuthProvider';
import CloudAuth from '../cloud-auth/CloudAuth';
import { hashSecureString } from '../cloud-utils/Crypto';
import CloudContext from '../aven-cloud/CloudContext';
import createCloudClient from '../aven-cloud/createCloudClient';
import createMemoryDataSource from '../aven-cloud/createMemoryDataSource';
import EmailAgent from '../email-agent-sendgrid/EmailAgent';
import SMSAgent from '../sms-agent-twilio/SMSAgent';
import WebServer from '../aven-web/WebServer';

import App from './App';

const getEnv = c => process.env[c];

const runServer = async () => {
  console.log('☁️ Starting Cloud 💨');

  const dataSource = await createMemoryDataSource({
    domain: 'example.aven.cloud',
  });
  const client = createCloudClient({
    dataSource,
    domain: 'example.aven.cloud',
  });

  const emailAgent =
    getEnv('SENDGRID_API_KEY') &&
    EmailAgent({
      defaultFromEmail: 'Aven Cloud <support@aven.io>',
      config: {
        sendgridAPIKey: getEnv('SENDGRID_API_KEY'),
      },
    });

  const smsAgent =
    getEnv('TWILIO_ACCOUNT_SID') &&
    SMSAgent({
      defaultFromNumber: getEnv('TWILIO_FROM_NUMBER'),
      config: {
        accountSid: getEnv('TWILIO_ACCOUNT_SID'),
        authToken: getEnv('TWILIO_AUTH_TOKEN'),
      },
    });

  const smsAuthProvider =
    smsAgent &&
    SMSAuthProvider({
      agent: smsAgent,
    });

  const rootPasswordHash = await hashSecureString('hello');

  const rootAuthProvider = RootAuthProvider({
    rootPasswordHash,
  });

  const emailAuthProvider =
    emailAgent &&
    EmailAuthProvider({
      agent: emailAgent,
    });

  const providers = [];
  if (smsAuthProvider) providers.push(smsAuthProvider);
  if (emailAuthProvider) providers.push(emailAuthProvider);
  if (rootAuthProvider) providers.push(rootAuthProvider);

  const authenticatedDataSource = CloudAuth({ dataSource, providers });

  const serverListenLocation = getEnv('PORT');
  const context = new Map();
  context.set(CloudContext, client);
  const webService = await WebServer({
    App,
    context,
    dataSource: authenticatedDataSource,
    serverListenLocation,
  });
  console.log('☁️️ Web Ready 🕸');

  return {
    close: async () => {
      await webService.close();
      await authenticatedDataSource.close();
      await dataSource.close();
      if (emailAgent) await emailAgent.close();
      if (smsAgent) await smsAgent.close();
    },
  };
};

export default runServer;
