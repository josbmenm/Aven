import App from './App';
import WebServer from '../aven-web/WebServer';
import { writeTags, readTags, createSchema } from './Robot';

const schema = createSchema({
  inputCard0: {
    program: undefined, // undefined means controller tag
    tag: 'Local:2:I.Data.0',
    type: 'boolean',
  },
  myOutput: {
    program: undefined, // undefined means controller tag
    tag: 'output1',
    type: 'boolean',
    enableOutput: true,
  },
});

const runServer = async () => {
  console.log('☁️ Starting Cloud 💨');

  const dispatch = async action => {
    switch (action.type) {
      case 'writeTags':
        return await writeTags(schema, action);
      case 'readTags':
        return await readTags(schema, action);
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
