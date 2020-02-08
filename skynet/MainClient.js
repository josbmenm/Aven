import App from './SkynetApp';

import startWebClient from '../aven-web/WebClient';
import { CloudContext } from '../cloud-core/KiteReact';
import { createBrowserClient } from '../cloud-browser';
import createBrowserNetworkSource from '../cloud-browser/createBrowserNetworkSource';
import { HostContext } from '../cloud-core/HostContext';

const hostConfig = {
  authority: window.location.host,
  useSSL: window.location.protocol !== 'http:',
};

const networkSource = createBrowserNetworkSource(hostConfig);

const cloud = createBrowserClient({
  source: networkSource,
  domain: 'onofood.co',
});

const context = new Map();

context.set(CloudContext, cloud);
context.set(HostContext, hostConfig);

export default function startClient() {
  startWebClient(App, context, { cloud });
}
