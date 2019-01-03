import startMemoryDataSource from '../startMemoryDataSource';
import dataSourceTests from './dataSourceTests';

beforeAll(async () => {});

async function startTestDataSource(options = {}) {
  const ds = startMemoryDataSource({ domain: 'test', ...options });
  return ds;
}

describe('memory data source tests', () => {
  dataSourceTests(startTestDataSource);
});

describe('basic data source setup', () => {
  test('throws when starting without a domain', () => {
    expect(() => {
      startMemoryDataSource({});
    }).toThrow();
  });
});
