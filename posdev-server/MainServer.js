import App from './App';
import WebServer from '../aven-web/WebServer';

import { getConnectionToken, capturePayment } from '../stripe-server/Stripe';

const getEnv = c => process.env[c];

const runServer = async () => {
  console.log('☁️ Starting Restaurant Server 💨 ');

  const dispatch = async action => {
    switch (action.type) {
      case 'StripeGetConnectionToken':
        return getConnectionToken(action);
      case 'StripeCapturePayment':
        return capturePayment(action);
      default:
        return {};
    }
  };

  const serverListenLocation = getEnv('PORT');

  const context = new Map();
  const webService = await WebServer({
    App,
    context,
    source: {
      dispatch,
    },
    serverListenLocation,
    assets: require(process.env.RAZZLE_ASSETS_MANIFEST),
  });
  console.log('☁️️ Web Ready 🕸');

  return {
    close: async () => {
      await webService.close();
      console.log('😵 Server Closed');
    },
  };
};

export default runServer;
