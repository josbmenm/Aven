import App from './SkynetApp';

import startWebClient from '../aven-web/WebClient';
import CloudContext from '../cloud-core/CloudContext';
import createCloudClient from '../cloud-core/createCloudClient';
import createBrowserNetworkSource from '../cloud-browser/createBrowserNetworkSource';
import RestaurantReducer from '../logic/RestaurantReducer';

const hostConfig = {
  authority: window.location.host,
  useSSL: window.location.protocol !== 'http:',
};

const networkSource = createBrowserNetworkSource(hostConfig);

const cloud = createCloudClient({
  source: networkSource,
  domain: 'onofood.co',
  functions: [RestaurantReducer],
});

const context = new Map();

context.set(CloudContext, cloud);

export default function startClient() {
  startWebClient(App, context);
}
