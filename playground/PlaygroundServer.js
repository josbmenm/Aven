import App from './PlaygroundApp';
import WebServer from '../aven-web/WebServer';
import { IS_DEV } from '../aven-web/config';

import { createClient } from '../cloud-core/Kite';
import { CloudContext } from '../cloud-core/KiteReact';
import createNodeNetworkSource from '../cloud-server/createNodeNetworkSource';

import { HostContext } from '../components/AirtableImage';

const getEnv = c => process.env[c];

const startSkynetServer = async () => {
  console.log('☁️ Starting Website 💨');

  const domain = 'onofood.co';
  console.log('☁️ Starting Playground 💨');

  console.log('Starting Node Network connection');
  const networkSource = await createNodeNetworkSource({
    authority: 'onofood.co',
    useSSL: true,
    quiet: true,
  });

  const cloud = createClient({
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
