import App from './App';

import startWebClient from '../aven-web/WebClient';

const context = new Map();

export default function startClient() {
  startWebClient(App, context);
}
