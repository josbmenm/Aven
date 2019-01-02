import startSQLDataSource from '../startSQLDataSource';
import Knex from 'knex';
import dataSourceTests from '../../aven-cloud/__tests__/dataSourceTests';
const pathJoin = require('path').join;

const DB_CONFIG = {
  client: 'pg',
  connection:
    'postgresql://postgres:aven-test-password@localhost:5432/postgres',
};

beforeAll(async () => {
  const knex = Knex(DB_CONFIG);
  await knex.migrate.latest({
    directory: pathJoin(__dirname, '../migrations'),
  });
  await knex.destroy();
});

const startTestDataSource = options =>
  startSQLDataSource({
    config: DB_CONFIG,
    ...options,
  });

describe('basic data source setup', () => {
  dataSourceTests(startTestDataSource);
});
