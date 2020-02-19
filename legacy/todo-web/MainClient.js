import App from './App';

import { startWebClient } from '@aven/web-browser';
import { createBrowserNetworkSource } from '@aven/cloud-browser';
import { createSessionClient } from '@aven/cloud-core';
import { CloudContext } from '@aven/cloud-core';

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
