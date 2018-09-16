import AvenClient from '@aven-cloud/web/Client';
import App from './Cloud';

AvenClient(App);

if (module.hot) {
  module.hot.accept();
}
