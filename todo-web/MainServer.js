import CloudContext from '../aven-cloud/CloudContext';
import createCloudClient from '../aven-cloud/createCloudClient';
import CloudAuth from '../cloud-auth/CloudAuth';
import createMemoryDataSource from '../aven-cloud/createMemoryDataSource';
import WebServer from '../aven-web/WebServer';
import SMSAgent from '../sms-agent-twilio/SMSAgent';
import EmailAgent from '../email-agent-sendgrid/EmailAgent';
import SMSAuthProvider from '../cloud-auth-sms/SMSAuthProvider';
import EmailAuthProvider from '../cloud-auth-email/EmailAuthProvider';
import RootAuthProvider from '../cloud-auth-root/RootAuthProvider';
import { hashSecureString } from '../cloud-utils/Crypto';

import App from './App';

const runServer = async () => {
  console.log('☁️ Starting Cloud 💨');

  const dataSource = await createMemoryDataSource({
    domain: 'todo.aven.cloud',
  });

  const emailAgent = EmailAgent({
    defaultFromEmail: 'Aven Todos <support@aven.io>',
    config: {
      sendgridAPIKey: process.env.SENDGRID_API_KEY,
    },
  });

  const emailAuthProvider = EmailAuthProvider({
    agent: emailAgent,
  });

  const smsAgent = SMSAgent({
    defaultFromNumber: process.env.TWILIO_FROM_NUMBER,
    config: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
    },
  });

  const smsAuthProvider = SMSAuthProvider({
    agent: smsAgent,
    getMessage: (authCode, verifyInfo, accountId) => {
      return `Todos App Auth Code: ${authCode}`;
    },
  });

  // UNSAFE, TESTING ONLY! DELETE ME BEFORE PRODUCTION!
  const rootAuthProvider = RootAuthProvider({
    rootPasswordHash: await hashSecureString('pw'),
  });
  const authSource = CloudAuth({
    dataSource,
    providers: [smsAuthProvider, emailAuthProvider, rootAuthProvider],
  });

  async function putPermission({ name, defaultRule }) {
    await authSource.dispatch({
      domain: 'todo.aven.cloud',
      type: 'PutPermissionRules',
      auth: {
        accountId: 'root',
        verificationInfo: {},
        verificationResponse: { password: 'pw' },
      },
      defaultRule,
      name,
    });
  }

  await putPermission({
    defaultRule: { canRead: true, canWrite: true },
    name: 'Todos',
  });

  const client = createCloudClient({
    authSource,
    domain: 'todo.aven.cloud',
  });

  const getEnv = c => process.env[c];
  const serverListenLocation = getEnv('PORT');
  const context = new Map();
  context.set(CloudContext, client);
  const webService = await WebServer({
    App,
    context,
    dataSource: authSource,
    serverListenLocation,
  });
  console.log('☁️️ Web Ready 🕸');

  return {
    close: async () => {
      await webService.close();
      await dataSource.close();
    },
  };
};

export default runServer;
