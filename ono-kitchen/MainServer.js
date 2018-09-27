import App from './App';
import WebServer from '../aven-web/WebServer';

const runServer = async () => {
  console.log('☁️ Starting Cloud 💨');

  const dispatch = async action => {
    switch (action.type) {
      case 'getFoo':
        return { foo: 42 };
      default:
        throw `Unknown action type "${action.type}"`;
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
