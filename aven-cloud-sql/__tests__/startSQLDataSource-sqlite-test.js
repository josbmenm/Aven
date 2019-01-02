import startSQLDataSource from '../startSQLDataSource';
import Knex from 'knex';
import dataSourceTests from '../../aven-cloud/__tests__/dataSourceTests';
const fs = require('fs-extra');
const pathJoin = require('path').join;

const DB_CONFIG = {
  useNullAsDefault: true,
  client: 'sqlite3',
  connection: {
    filename: './testdb.sqlite',
  },
};

beforeEach(async () => {
  await fs.remove('./testdb.sqlite');
  const knex = Knex(DB_CONFIG);
  await knex.migrate.latest({
    directory: pathJoin(__dirname, '../migrations'),
  });
});

const startTestDataSource = options =>
  startSQLDataSource({
    config: DB_CONFIG,
    ...options,
  });

describe('basic data source setup', () => {
  dataSourceTests(startTestDataSource);
});
