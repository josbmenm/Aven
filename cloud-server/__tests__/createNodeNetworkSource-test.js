import createMemoryDataSource from '../../aven-cloud/createMemoryDataSource';
import dataSourceTests from '../../aven-cloud/__tests__/dataSourceTests';
import createNodeNetworkSource from '../createNodeNetworkSource';
import startSourceServer from '../startSourceServer';

beforeAll(async () => {});

let portOffset = 0;

jest.setTimeout(10000);

async function startTestDataSource(options = {}) {
  const ds = createMemoryDataSource({ domain: 'test', ...options });
  portOffset += 1;
  let port = 9900 + portOffset;
  const server = await startSourceServer({
    dataSource: ds,
    listenLocation: port,
    quiet: true,
  });
  const clientDs = createNodeNetworkSource({
    useSSL: false,
    authority: `localhost:${port}`,
    quiet: true,
  });
  return {
    ...clientDs,
    testPatienceMS: 1200,
    close: () => {
      clientDs.close();
      server.close();
      ds.close();
    },
  };
}

describe('memory data source tests through network', () => {
  dataSourceTests(startTestDataSource);
});
