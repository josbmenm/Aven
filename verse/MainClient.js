import App from './App';

import startWebClient from '../aven-web/WebClient';
import { CloudContext } from '../cloud-core/KiteReact';
import { createClient } from '../cloud-core/Kite';
import createBrowserNetworkSource from '../cloud-browser/createBrowserNetworkSource';

const restaurantSource = createBrowserNetworkSource({
  useSSL: window.location.protocol !== 'http:',
  authority: window.location.host,
});

const cloud = createClient({
  source: restaurantSource,
  domain: 'onofood.co',
});

const context = new Map();

context.set(CloudContext, cloud);

export default function startClient() {
  startWebClient(App, context);
}
