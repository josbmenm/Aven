import AvenClient from '../aven-web/Client';
import App from './Presentation';

AvenClient(App);

if (module.hot) {
  module.hot.accept();
}
