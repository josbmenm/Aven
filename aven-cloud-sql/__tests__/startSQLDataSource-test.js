import startSQLDataSource from '../startSQLDataSource';
import Knex from 'knex';
const fs = require('fs-extra');
const pathJoin = require('path').join;

beforeEach(async () => {
  await fs.remove('./testdb.sqlite');
  const knex = Knex({
    useNullAsDefault: true,
    client: 'sqlite3',
    connection: {
      filename: './testdb.sqlite',
    },
  });
  await knex.migrate.latest({
    directory: pathJoin(__dirname, '../migrations'),
  });
});

const startTestDataSource = options =>
  startSQLDataSource({
    config: {
      client: 'sqlite3',
      useNullAsDefault: true,
      connection: {
        filename: './testdb.sqlite',
      },
    },
    ...options,
  });

describe('basic data source setup', () => {
  test('puts and gets object', async () => {
    const ds = await startTestDataSource({ domain: 'test' });
    const putResult = await ds.dispatch({
      type: 'PutObject',
      domain: 'test',
      value: { foo: 'bar' },
    });
    const obj = await ds.dispatch({
      type: 'GetObject',
      domain: 'test',
      id: putResult.id,
    });
    expect(obj.value.foo).toEqual('bar');
  });
});
