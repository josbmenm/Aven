import App from './SneezyApp';
import startWebClient from '../aven-web/WebClient';
import { CloudContext } from '../cloud-core/KiteReact';
import { createClient } from '../cloud-core/Kite';
import createBrowserNetworkSource from '../cloud-browser/createBrowserNetworkSource';
import { HostContext } from '../components/AirtableImage';

const hostConfig = {
  authority: window.location.host,
  useSSL: window.location.protocol !== 'http:',
};

const networkSource = createBrowserNetworkSource(hostConfig);

const cloud = createClient({
  source: networkSource,
  domain: 'onofood.co',
});

const context = new Map();

context.set(CloudContext, cloud);
context.set(HostContext, hostConfig);

export default function startClient() {
  startWebClient(App, context);
}
