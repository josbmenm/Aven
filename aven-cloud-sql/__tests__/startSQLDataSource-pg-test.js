import startSQLDataSource from '../startSQLDataSource';
import Knex from 'knex';
import dataSourceTests from './dataSourceTests';
const pathJoin = require('path').join;

const DB_CONFIG = {
  client: 'pg',
  connection:
    'postgresql://postgres:aven-test-password@localhost:5432/postgres',
};

jest.setTimeout(15000);

beforeAll(async () => {
  const knex = Knex(DB_CONFIG);
  await knex.migrate.latest({
    directory: pathJoin(__dirname, '../migrations'),
  });
  await knex.destroy();
});

async function startTestDataSource(options) {
  const sqlDataSource = await startSQLDataSource({
    config: DB_CONFIG,
    domains: ['test'],
    ...options,
  });
  return {
    testPatienceMS: 1500,
    ...sqlDataSource,
  };
}

describe('basic data source setup', () => {
  beforeEach(async () => {
    const knex = Knex(DB_CONFIG);
    await knex.raw(`
    DELETE FROM doc_ownership;
    DELETE FROM docs;
    DELETE FROM block_ownership;
    DELETE FROM blocks;
    DELETE FROM domains;`);
    await knex.destroy();
  });
  dataSourceTests(startTestDataSource);
});
