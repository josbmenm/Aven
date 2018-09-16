import AvenClient from '@aven-cloud/web/Client';
import App from './AppWeb';

AvenClient(App);

if (module.hot) {
  module.hot.accept();
}
