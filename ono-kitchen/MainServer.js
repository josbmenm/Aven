import App from './App';
import WebServer from '../aven-web/WebServer';
import { kitchenDispatch } from './Robot';

const runServer = async () => {
  console.log('☁️ Starting Restaurant Server 💨');

  const dispatch = async action => {
    switch (action.type) {
      default:
        return await kitchenDispatch(action);
    }
  };

  const webService = await WebServer(App, dispatch);
  console.log('☁️️ Web Ready 🕸');

  return {
    close: async () => {
      await webService.close();
    },
  };
};

export default runServer;
