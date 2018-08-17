import AvenClient from '../aven-web/Client';
import App from './App';

AvenClient(App);

if (module.hot) {
  module.hot.accept();
}
