import App from './App';

import startWebClient from '../aven-web/WebClient';
import OnoCloudContext from '../ono-cloud/OnoCloudContext';
import OnoRestaurantContext from '../ono-cloud/OnoRestaurantContext';
import createCloudClient from '../aven-cloud/createCloudClient';
import createBrowserNetworkSource from '../aven-cloud-browser/createBrowserNetworkSource';
import createOnoCloudClient from '../ono-cloud/createOnoCloudClient';

const IS_DEV = process.env.NODE_ENV !== 'production';

const RESTAURANT_DEV = {
  useSSL: false,
  authority: 'localhost:8830',
};
const RESTAURANT_PROD = {
  authority: 'www.onofood.co',
};

// const RESTAURANT_CONFIG = RESTAURANT_DEV;
// const RESTAURANT_CONFIG = RESTAURANT_PROD;
const RESTAURANT_CONFIG = IS_DEV ? RESTAURANT_DEV : RESTAURANT_PROD;

const restaurantSource = createBrowserNetworkSource(RESTAURANT_CONFIG);

const restaurantClient = createCloudClient({
  dataSource: restaurantSource,
  domain: 'kitchen.maui.onofood.co',
});

const context = new Map();

context.set(OnoRestaurantContext, restaurantClient);

export default function startClient() {
  startWebClient(App, context);
}
