import App from './PlaygroundApp';
import attachWebServer from '../aven-web/attachWebServer';
import { IS_DEV } from '../aven-web/config';

import { createClient } from '../cloud-core/Kite';
import { CloudContext } from '../cloud-core/KiteReact';
import createNodeNetworkSource from '../cloud-server/createNodeNetworkSource';

import { HostContext } from '../cloud-core/HostContext';
import { sendEmailDO_NOT_USE_ME } from '../emails/Emails';
import EmailAgent from '../email-agent-sendgrid/EmailAgent';

const getEnv = c => process.env[c];

export default async function startPlaygroundServer(httpServer) {
  console.log('☁️ Starting Website 💨');

  const domain = 'onofood.co';
  console.log('☁️ Starting Playground 💨');

  console.log('Starting Node Network connection');
  const networkSource = await createNodeNetworkSource({
    authority: 'onoblends.co',
    useSSL: true,
    quiet: true,
  });

  const cloud = createClient({
    source: [networkSource],
    domain,
  });

  const context = new Map();
  context.set(CloudContext, cloud);
  context.set(HostContext, { authority: 'onoblends.co', useSSL: !IS_DEV });

  const emailAgent = EmailAgent({
    defaultFromEmail: 'Ono Blends <aloha@onofood.co>',
    config: {
      sendgridAPIKey: getEnv('SENDGRID_API_KEY'),
    },
  });

  const dispatch = async action => {
    switch (action.type) {
      case 'TestEmail': {
        return await sendEmailDO_NOT_USE_ME(emailAgent, action);
      }
      default:
        return await networkSource.dispatch(action);
    }
  };

  const serverListenLocation = getEnv('PORT');
  const webService = await attachWebServer({
    httpServer,
    context,
    mainDomain: domain,
    App,
    source: {
      ...networkSource,
      dispatch,
    },
    serverListenLocation,
    assets: require(process.env.RAZZLE_ASSETS_MANIFEST),
  });
  console.log('☁️️ Web Ready 🕸');

  return {
    close: async () => {
      await networkSource.close();
      await webService.close();
    },
  };
}
