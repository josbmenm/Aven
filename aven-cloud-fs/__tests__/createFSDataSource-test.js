import createFSDataSource from '../createFSDataSource';
import dataSourceTests from '../../aven-cloud/__tests__/dataSourceTests';
import uuid from 'uuid/v1';

const pathJoin = require('path').join;

const TMP_DIR = require('os').tmpdir();

beforeAll(async () => {});

async function startTestDataSource(options) {
  const dataDir = pathJoin(TMP_DIR, uuid());
  return createFSDataSource({
    domain: 'test',
    dataDir,
    ...options,
  });
}

describe('data source tests', () => {
  dataSourceTests(startTestDataSource);
});

describe('basic fs source setup', () => {
  test('throws when starting without a domain', () => {
    const dataDir = pathJoin(TMP_DIR, uuid());
    expect(
      createFSDataSource({
        dataDir,
      }),
    ).rejects.toThrow();
  });
  test('throws when starting without a data directory', () => {
    expect(
      createFSDataSource({
        domain: 'test',
      }),
    ).rejects.toThrow();
  });
});

describe('persistence', () => {
  test('block persistence', async () => {
    const dataDir = pathJoin(TMP_DIR, uuid());

    const ds1 = await startTestDataSource({ dataDir });
    const putResult = await ds1.dispatch({
      type: 'PutBlock',
      name: 'foo',
      domain: 'test',
      value: { bar: 42 },
    });
    await ds1.close();

    const ds2 = await startTestDataSource({ dataDir });
    const result = await ds2.dispatch({
      type: 'GetBlock',
      name: 'foo',
      domain: 'test',
      id: putResult.id,
    });
    expect(result.value.bar).toEqual(42);
    await ds2.close();
  });

  test('doc persistence', async () => {
    const dataDir = pathJoin(TMP_DIR, uuid());

    const ds1 = await startTestDataSource({ dataDir });
    const putBlockResult = await ds1.dispatch({
      type: 'PutBlock',
      name: 'foo',
      domain: 'test',
      value: { bar: 42 },
    });
    const putResult = await ds1.dispatch({
      type: 'PutDoc',
      name: 'foo',
      domain: 'test',
      id: putBlockResult.id,
    });
    await ds1.close();

    const ds2 = await startTestDataSource({ dataDir });
    const result = await ds2.dispatch({
      type: 'GetDoc',
      name: 'foo',
      domain: 'test',
    });
    expect(result.id).toEqual(putBlockResult.id);
    await ds2.close();
  });
});
