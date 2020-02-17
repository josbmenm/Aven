import _ from './Setup';

import App from './WingWebApp';

import { startWebClient } from '@aven/web-browser';
import { createBrowserNetworkSource } from '@aven/cloud-browser';
import { createSessionClient, CloudContext } from '@aven/cloud-core';

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

startWebClient(App, context);
