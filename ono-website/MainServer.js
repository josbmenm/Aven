import App from './App';
import WebServer from '../aven-web/WebServer';

const runServer = async () => {
  console.log('☁️ Starting Website 💨');

  const dispatch = async action => {
    switch (action.type) {
      default:
        return { error: 'Action not found' };
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
