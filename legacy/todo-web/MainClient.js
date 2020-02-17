import App from './App';

import startWebClient from '../aven-web/WebClient';
import createBrowserNetworkSource from '../cloud-browser/createBrowserNetworkSource';
import { createSessionClient } from '../cloud-core/Kite';
import { CloudContext } from '../cloud-core/KiteReact';

const networkSource = createBrowserNetworkSource({
  authority: null, // this means to inherit from the server
  useSSL: null,
});

const client = createSessionClient({
  source: networkSource,
  domain: 'todo.aven.io',
  auth: null,
});

const context = new Map();

context.set(CloudContext, client);

export default function startClient() {
  startWebClient(App, context);
}
