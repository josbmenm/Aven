import createMemoryStorageSource from '../createMemoryStorageSource';
import createTransactionDataSource from '../createTransactionDataSource';

beforeAll(async () => {});

test('TransactDoc action', async () => {
  // this action behaves like PutDoc, but always forces the type and "on" to be set

  const ds = createMemoryStorageSource({ domain: 'test' });
  const ts = createTransactionDataSource(ds);

  // transact on nonexistent value
  const { id } = await ts.dispatch({
    type: 'TransactDoc',
    name: 'foo',
    domain: 'test',
    value: {
      type: 'TransactionValue',
      on: null,
      value: {
        name: 'init',
      },
    },
  });

  await expect(
    // this is the incorrect doc format. must be type: TransactionValue
    ts.dispatch({
      type: 'TransactDoc',
      name: 'foo',
      domain: 'test',
      value: {
        name: 'changed',
      },
    }),
  ).rejects.toThrow();

  await expect(
    // this the previous doc is not on null
    ts.dispatch({
      type: 'TransactDoc',
      name: 'foo',
      domain: 'test',
      value: {
        type: 'TransactionValue',
        on: null,
        value: {
          name: 'changed',
        },
      },
    }),
  ).rejects.toThrow();

  // failed transaction with bad "on" block reference
  await expect(
    ts.dispatch({
      type: 'TransactDoc',
      name: 'foo',
      domain: 'test',
      value: {
        type: 'TransactionValue',
        on: { type: 'BlockReference', id: 'badId' },
        value: {
          name: 'changed',
        },
      },
    }),
  ).rejects.toThrow();

  const result = await ts.dispatch({
    type: 'TransactDoc',
    name: 'foo',
    domain: 'test',
    value: {
      type: 'TransactionValue',
      on: { type: 'BlockReference', id },
      value: {
        name: 'changed',
      },
    },
  });

  expect(result.id).not.toBe(null);

  const valueResult = await ts.dispatch({
    type: 'GetDocValue',
    name: 'foo',
    domain: 'test',
  });

  expect(valueResult.value.on.id).toEqual(id);
  expect(valueResult.value.value.name).toEqual('changed');
});
