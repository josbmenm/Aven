import App from './App';

import startWebClient from '../aven-web/WebClient';
import CloudContext from '../cloud-core/CloudContext';
import createCloudClient from '../cloud-core/createCloudClient';
import createBrowserNetworkSource from '../cloud-browser/createBrowserNetworkSource';
import RestaurantReducer from '../logic/RestaurantReducer';

const IS_DEV = process.env.NODE_ENV !== 'production';

const RESTAURANT_DEV = {
  useSSL: false,
  authority: 'localhost:8830',
};
const RESTAURANT_PROD = {
  authority: 'restaurant0.maui.onofood.co:8830',
  useSSL: false,
};

// const RESTAURANT_CONFIG = RESTAURANT_DEV;
// const RESTAURANT_CONFIG = RESTAURANT_PROD;
const RESTAURANT_CONFIG = IS_DEV ? RESTAURANT_DEV : RESTAURANT_PROD;

const restaurantSource = createBrowserNetworkSource(RESTAURANT_CONFIG);

const cloud = createCloudClient({
  source: restaurantSource,
  domain: 'onofood.co',
  functions: [RestaurantReducer],
});

const context = new Map();

context.set(CloudContext, cloud);

export default function startClient() {
  startWebClient(App, context);
}
