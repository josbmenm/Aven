import AvenClient from '../aven-web/Client';
import App from './Website';

AvenClient(App);

if (module.hot) {
  module.hot.accept();
}
