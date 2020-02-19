import { EmailAuthProvider } from '@aven/cloud-auth-email';
import { RootAuthProvider } from '@aven/cloud-auth-root';
import { SMSAuthProvider } from '@aven/cloud-auth-sms';
import { createProtectedSource } from '@aven/cloud-auth';
import { hashSecureString } from '@aven/cloud-utils';
import { CloudContext } from '@aven/cloud-core';
import { createCloudClient } from '@aven/cloud-core';
import { createMemoryStorageSource } from '@aven/cloud-core';
import { EmailAgent } from '@aven/email-agent-sendgrid';
import { SMSAgent } from '@aven/sms-agent-twilio';
import WebServer from '../aven-web/WebServer';

import App from './App';

const getEnv = c => process.env[c];

const runServer = async () => {
  console.log('☁️ Starting Cloud 💨');

  const storageSource = await createMemoryStorageSource({
    domain: 'example.aven.cloud',
  });
  const client = createCloudClient({
    source: storageSource,
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

  const authenticatedDataSource = createProtectedSource({
    source: storageSource,
    providers,
  });

  const serverListenLocation = getEnv('PORT');
  const context = new Map();
  context.set(CloudContext, client);
  const webService = await WebServer({
    App,
    context,
    source: authenticatedDataSource,
    serverListenLocation,
    assets: require(process.env.RAZZLE_ASSETS_MANIFEST),
  });
  console.log('☁️️ Web Ready 🕸');

  return {
    close: async () => {
      await webService.close();
      await authenticatedDataSource.close();
      await storageSource.close();
      if (emailAgent) await emailAgent.close();
      if (smsAgent) await smsAgent.close();
    },
  };
};

export default runServer;
