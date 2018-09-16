import AvenClient from '@aven-cloud/web/Client';
import App from './Presentation';

AvenClient(App);

if (module.hot) {
  module.hot.accept();
}
