import createFSDataSource from '../startFSDataSource';
import dataSourceTests from '../../aven-cloud/__tests__/dataSourceTests';
import uuid from 'uuid/v1';

const pathJoin = require('path').join;

const TMP_DIR = require('os').tmpdir();

beforeAll(async () => {});

async function startTestDataSource(options = {}) {
  const dataDir = pathJoin(TMP_DIR, uuid());
  return createFSDataSource({
    domain: 'test',
    dataDir,
    ...options,
  });
}

describe('fs data source tests', () => {
  dataSourceTests(startTestDataSource);
});

describe('basic fs source setup', () => {
  test('throws when starting without a domain', () => {
    const dataDir = pathJoin(TMP_DIR, uuid());
    expect(
      createFSDataSource({
        dataDir,
      })
    ).rejects.toThrow();
  });
  test('throws when starting without a data directory', () => {
    expect(
      createFSDataSource({
        domain: 'test',
      })
    ).rejects.toThrow();
  });
});

describe('persistence', () => {
  test('doc persistence', async () => {
    const dataDir = pathJoin(TMP_DIR, uuid());

    const ds1 = await startTestDataSource({ dataDir });
    const putResult = await ds1.dispatch({
      type: 'PutDocValue',
      name: 'foo',
      domain: 'test',
      value: { bar: 42 },
    });
    await ds1.close();

    const ds2 = await startTestDataSource({ dataDir });
    const result = await ds2.dispatch({
      type: 'GetDoc',
      name: 'foo',
      domain: 'test',
    });
    expect(result.id).toEqual(putResult.id);
    await ds2.close();
  });

  // should also test persitence of doc children lists, and deeply referenced blocks
});
