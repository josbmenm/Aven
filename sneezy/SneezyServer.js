import App from './SneezyApp';
import WebServer from '../aven-web/WebServer';
import { IS_DEV } from '../aven-web/config';

import createCloudClient from '../cloud-core/createCloudClient';
import CloudContext from '../cloud-core/CloudContext';
import createNodeNetworkSource from '../cloud-server/createNodeNetworkSource';

import { HostContext } from '../components/AirtableImage';
import { sendReceiptEmail } from './sendReceipt'

const getEnv = c => process.env[c];

const startSkynetServer = async () => {
  console.log('☁️ Starting Website 💨');

  const domain = 'onofood.co';
  console.log('☁️ Starting Sneezy 💨');

  console.log('Starting Node Network connection');
  const networkSource = await createNodeNetworkSource({
    authority: 'onofood.co',
    useSSL: true,
    quiet: true,
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
      case 'ReceiptEmail':
        return await sendReceiptEmail();
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
