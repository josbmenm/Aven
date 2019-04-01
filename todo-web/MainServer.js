import CloudContext from '../cloud-core/CloudContext';
import createEvalSource from '../cloud-core/createEvalSource';
import createCloudClient from '../cloud-core/createCloudClient';
import CloudAuth from '../cloud-auth/CloudAuth';
import startFSStorageSource from '../cloud-fs/startFSStorageSource';
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

  const storageSource = await startFSStorageSource({
    domain: 'todo.aven.io',
    dataDir: './db',
  });

  const evalDocs = {
    TaskReducer: a => [{ id: 'z', title: 'Coming Soon' }],
  };

  const source = createEvalSource({ source, domain: 'todo.aven.io', evalDocs });

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
  const protectedSource = CloudAuth({
    source,
    providers: [smsAuthProvider, emailAuthProvider, rootAuthProvider],
  });

  async function putPermission({ name, defaultRule }) {
    await protectedSource.dispatch({
      domain: 'todo.aven.io',
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
    source: protectedSource,
    domain: 'todo.aven.io',
  });

  const getEnv = c => process.env[c];
  const serverListenLocation = getEnv('PORT');
  const context = new Map();
  context.set(CloudContext, client);
  const webService = await WebServer({
    App,
    context,
    source,
    // source: protectedSource,
    serverListenLocation,
  });
  console.log('☁️️ Web Ready 🕸');

  return {
    close: async () => {
      await webService.close();
      await source.close();
    },
  };
};

export default runServer;
