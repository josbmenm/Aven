import AvenClient from '../aven-web/Client';
import App from './Playground';

AvenClient(App);

if (module.hot) {
  module.hot.accept();
}
