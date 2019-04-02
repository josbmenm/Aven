import CloudContext from '../cloud-core/CloudContext';
import createEvalSource from '../cloud-core/createEvalSource';
import createCloudClient from '../cloud-core/createCloudClient';
import CloudAuth from '../cloud-auth/CloudAuth';
import startFSStorageSource from '../cloud-fs/startFSStorageSource';
import WebServer from '../aven-web/WebServer';
import SMSAgent from '../sms-agent-twilio/SMSAgent';
import EmailAgent from '../email-agent-sendgrid/EmailAgent';
import SMSAuthProvider from '../cloud-auth-sms/SMSAuthProvider';
import EmailAuthProvider from '../cloud-auth-email/EmailAuthProvider';
import RootAuthProvider from '../cloud-auth-root/RootAuthProvider';
import { hashSecureString } from '../cloud-utils/Crypto';

import App from './App';

const runServer = async () => {
  console.log('☁️ Starting Cloud 💨');

  const storageSource = await startFSStorageSource({
    domain: 'todo.aven.io',
    dataDir: './db',
  });

  function createReducerLambda(reducerName, initialState, reducerFn) {
    return (docState, doc, cloud, useValue) => {
      let state = initialState;
      if (docState === undefined) {
        return state;
      }
      let action = docState.value;
      if (docState.on && docState.on.id) {
        const ancestorName = `${doc.getFullName()}#${
          docState.on.id
        }^${reducerName}`;
        state = useValue(cloud.get(ancestorName));
      }
      return reducerFn(state, action);
    };
  }

  function TaskReducer(state, action) {
    if (action.type === 'AddTask') {
      return [...state, action.params];
    } else if (action.type === 'SetTaskCompletion') {
      const taskIndex = state.findIndex(t => t.id === action.id);
      if (taskIndex === -1) {
        return state;
      }
      const newState = [...state];
      const oldTask = state[taskIndex];
      newState[taskIndex] = { ...oldTask, isComplete: action.isComplete };
      return newState;
    } else if (action.type === 'RemoveTask') {
      return state.filter(t => t.id !== action.id);
    }
    return state;
  }

  const evalDocs = {
    // TaskReducer: a => [{ id: 'z', title: 'Coming Soon' }],
    TaskReducer: createReducerLambda('TaskReducer', [], TaskReducer),
  };

  const source = createEvalSource({
    source: storageSource,
    domain: 'todo.aven.io',
    evalDocs,
  });

  const emailAgent = EmailAgent({
    defaultFromEmail: 'Aven Todos <support@aven.io>',
    config: {
      sendgridAPIKey: process.env.SENDGRID_API_KEY,
    },
  });
  const emailAuthProvider = EmailAuthProvider({
    agent: emailAgent,
  });

  const smsAgent = SMSAgent({
    defaultFromNumber: process.env.TWILIO_FROM_NUMBER,
    config: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
    },
  });
  const smsAuthProvider = SMSAuthProvider({
    agent: smsAgent,
    getMessage: (authCode, verifyInfo, accountId) => {
      return `Todos App Auth Code: ${authCode}`;
    },
  });

  // UNSAFE, TESTING ONLY! DELETE ME BEFORE PRODUCTION!
  const rootAuthProvider = RootAuthProvider({
    rootPasswordHash: await hashSecureString('pw'),
  });

  const protectedSource = CloudAuth({
    source,
    providers: [smsAuthProvider, emailAuthProvider, rootAuthProvider],
  });

  async function putPermission({ name, defaultRule }) {
    await protectedSource.dispatch({
      domain: 'todo.aven.io',
      type: 'PutPermissionRules',
      auth: {
        accountId: 'root',
        verificationInfo: {},
        verificationResponse: { password: 'pw' },
      },
      defaultRule,
      name,
    });
  }

  await putPermission({
    defaultRule: { canRead: true, canWrite: true },
    name: 'Todos',
  });

  await putPermission({
    defaultRule: { canRead: true, canWrite: true },
    name: 'TaskActions',
  });
  await putPermission({
    defaultRule: { canRead: true },
    name: 'TaskActions^TaskReducer',
  });
  const client = createCloudClient({
    source: protectedSource,
    domain: 'todo.aven.io',
  });

  const getEnv = c => process.env[c];
  const serverListenLocation = getEnv('PORT');
  const context = new Map();
  context.set(CloudContext, client);
  const webService = await WebServer({
    App,
    context,
    // source,
    source: protectedSource,
    serverListenLocation,
  });
  console.log('☁️️ Web Ready 🕸');

  return {
    close: async () => {
      await webService.close();
      await source.close();
    },
  };
};

export default runServer;
