import App from './DemoApp';

import startWebClient from '../aven-web/WebClient';
import { CloudContext } from '../cloud-core/KiteReact';
import { createClient } from '../cloud-core/Kite';
import createBrowserNetworkSource from '../cloud-browser/createBrowserNetworkSource';

const hostConfig = {
  authority: window.location.host,
  useSSL: window.location.protocol !== 'http:',
};

const networkSource = createBrowserNetworkSource(hostConfig);

const cloud = createClient({
  source: networkSource,
  domain: 'example.co',
});

const context = new Map();

context.set(CloudContext, cloud);

export default function startClient() {
  startWebClient(App, context, { cloud });
}
