import AvenClient from '@aven-cloud/web/Client';
import App from './App';

AvenClient(App);

if (module.hot) {
  module.hot.accept();
}
