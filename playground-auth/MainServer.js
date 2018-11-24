import App from './App';
import WebServer from '../aven-web/WebServer';
import startMemoryDataSource from '../aven-cloud/startMemoryDataSource';
import createCloudClient from '../aven-cloud/createCloudClient';
import CloudContext from '../aven-cloud/CloudContext';
import EmailAgent from '../aven-email-agent-sendgrid/EmailAgent';
import SMSAgent from '../aven-sms-agent-twilio/SMSAgent';
import SMSAuthMethod from '../aven-cloud-auth-sms/SMSAuthMethod';
import EmailAuthMethod from '../aven-cloud-auth-email/EmailAuthMethod';
import CloudAuth from '../aven-cloud-auth/CloudAuth';

const getEnv = c => process.env[c];

const runServer = async () => {
  console.log('☁️ Starting Cloud 💨');

  const dataSource = await startMemoryDataSource({
    domain: 'example.aven.cloud',
  });
  const client = createCloudClient({
    dataSource,
    domain: 'example.aven.cloud',
  });

  const emailAgent = EmailAgent({
    defaultFromEmail: 'Aven Cloud <support@aven.io>',
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
  // setTimeout(() => {
  //   console.log("sending sms!!");
  //   smsAgent.actions.sendSMS({
  //     to: "16502696176",
  //     message: "Many message"
  //   });
  // }, 3000);

  const smsAuthMethod = SMSAuthMethod({
    agent: smsAgent,
  });

  const emailAuthMethod = EmailAuthMethod({
    agent: emailAgent,
  });

  const authenticatedDataSource = CloudAuth({
    dataSource,
    methods: [smsAuthMethod, emailAuthMethod],
  });

  const serverListenLocation = getEnv('PORT');
  const context = new Map();
  context.set(CloudContext, client);
  const webService = await WebServer({
    App,
    context,
    authenticatedDataSource,
    serverListenLocation,
  });
  console.log('☁️️ Web Ready 🕸');

  return {
    close: async () => {
      await webService.close();
      await authenticatedDataSource.close();
      await dataSource.close();
      await emailAgent.close();
      await smsAgent.close();
    },
  };
};

export default runServer;
