import App from './DemoApp';
import attachWebServer from '../aven-web/attachWebServer';
import startPostgresStorageSource from '../cloud-postgres/startPostgresStorageSource';
import createMemoryStorageSource from '../cloud-core/createMemoryStorageSource';
import {
  createSessionClient,
  createReducerStream,
  createReducedDoc,
  createSyntheticDoc,
} from '../cloud-core/Kite';
import { CloudContext } from '../cloud-core/KiteReact';
import { defineCloudReducer } from '../cloud-core/KiteReact';
import { companyConfigToMenu } from '../logic/configLogic';
import {
  streamOfValue,
  combineStreams,
} from '../cloud-core/createMemoryStream';

const getEnv = c => process.env[c];

export default async function startDemoServer(httpServer) {
  const domain = 'example.co';
  const storageSource = createMemoryStorageSource({ domain });

  // const storageSource = await startPostgresStorageSource({
  //   domains: ['example.co'],
  //   config: {
  //     client: 'pg',
  //     connection: {
  //       ssl: {
  //         rejectUnauthorized: false,
  //       },
  //       user: getEnv('SQL_USER'),
  //       password: getEnv('SQL_PASSWORD'),
  //       database: getEnv('SQL_DATABASE'),
  //       host: getEnv('SQL_HOST'),
  //     },
  //   },
  // });

  const cloud = createSessionClient({
    source: storageSource,
    domain,
    auth: null,
  });

  const thingActions = cloud.get('ThingActions');

  cloud.setReducer('Things', {
    actionsDoc: thingActions,
    reducer: defineCloudReducer(
      'MyReducer',
      (prevState = {}, action) => {
        const prevThings = prevState.things || [];
        switch (action.type) {
          case 'Add': {
            return {
              ...prevState,
              things: [...prevThings, action.thing],
            };
          }
          case 'Remove': {
            return {
              ...prevState,
              things: prevThings.filter(t => t !== action.thing),
            };
          }
        }
      },
      {},
    ),
    snapshotInterval: 10,
    snapshotsDoc: cloud.get('ThingsSnapshot'),
  });

  const oddThings = cloud.docs.setOverrideValueStream(
    'OddThings',
    cloud.get('Things').value.stream.map(state => {
      return state.things && state.things.filter((_, i) => !i % 2);
    }),
  );

  const context = new Map();
  context.set(CloudContext, cloud); // bad idea.. each request should probably have independent client, for authentication!

  async function dispatch(action) {
    switch (action.type) {
      case 'CustomAction':
        // ...
        return {};
      default:
        return await cloud.dispatch(action);
    }
  }

  const serverListenLocation = getEnv('PORT');
  const webService = await attachWebServer({
    httpServer,
    context,
    screenProps: { cloud },
    mainDomain: domain,
    App,
    source: {
      ...cloud,
      dispatch,
    },
    serverListenLocation,
    assets: require(process.env.RAZZLE_ASSETS_MANIFEST),
  });
  console.log('☁️️ Web Ready 🕸');

  return {
    ...webService,
    close: async () => {
      await cloud.close();
      await webService.close();
    },
  };
}
