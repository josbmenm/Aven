import App from './App';

import startWebClient from '../aven-web/WebClient';

export default function startClient() {
  startWebClient(App);
}

if (module.hot) {
  module.hot.accept();
}