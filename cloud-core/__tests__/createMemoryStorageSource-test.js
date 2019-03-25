import createMemoryStorageSource from '../createMemoryStorageSource';
import dataSourceTests from './dataSourceTests';

beforeAll(async () => {});

async function startTestDataSource(options = {}) {
  const ds = createMemoryStorageSource({ domain: 'test', ...options });
  return ds;
}

describe('memory data source tests', () => {
  dataSourceTests(startTestDataSource);
});

describe('basic data source setup', () => {
  test('throws when starting without a domain', () => {
    expect(() => {
      createMemoryStorageSource({});
    }).toThrow();
  });
});
