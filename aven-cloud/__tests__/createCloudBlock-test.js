import startMemoryDataSource from '../startMemoryDataSource';
import createCloudBlock from '../createCloudBlock';

describe('object generic behavior', () => {
  test('handles creation with empty value', () => {
    const obj = createCloudBlock({
      dataSource: {},
      onNamedDispatch: () => {},
      id: 'asdf1234',
    });
    expect(obj.id).toBe('asdf1234');
  });
  test('fails on creation without onNamedDispatch', () => {
    expect(() =>
      createCloudBlock({
        value: { foo: 42 },
      })
    ).toThrow();
  });
  test('fails on creation without value or id', () => {
    expect(() =>
      createCloudBlock({
        onNamedDispatch: () => {},
      })
    ).toThrow();
  });
  test('handles creation with value', () => {
    const obj = createCloudBlock({
      onNamedDispatch: () => {},
      value: { foo: 42 },
    });
    expect(obj.id).toBe('e7e71fa8b5db791e2346856ee09cb45f867439e4');
  });
});

describe('basic object DataSource interaction', () => {
  test('fetches objects', async () => {
    const m = startMemoryDataSource({ domain: 'test' });
    const { id } = await m.dispatch({
      type: 'PutBlock',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    const c = createCloudBlock({
      onNamedDispatch: action =>
        m.dispatch({ ...action, name: 'foo', domain: 'test' }),
      id,
    });
    expect(c.getValue()).toEqual(undefined);
    expect(c.getBlock().lastFetchTime).toBe(null);
    await c.fetch();
    expect(c.getBlock().lastFetchTime).not.toBe(null);
    expect(c.getValue().foo).toEqual('bar');
  });
  test('fetches null objects', async () => {
    const m = startMemoryDataSource({ domain: 'test' });
    const { id } = await m.dispatch({
      type: 'PutBlock',
      domain: 'test',
      name: 'foo',
      value: null,
    });
    const c = createCloudBlock({
      onNamedDispatch: action =>
        m.dispatch({ ...action, name: 'foo', domain: 'test' }),
      id,
    });
    expect(c.getValue()).toEqual(undefined);
    expect(c.getBlock().lastFetchTime).toBe(null);
    await c.fetch();
    expect(c.getValue()).toEqual(null);
    expect(c.getBlock().lastFetchTime).not.toBe(null);
  });
  test('puts objects', async () => {
    const m = startMemoryDataSource({ domain: 'test' });

    const c = createCloudBlock({
      onNamedDispatch: action =>
        m.dispatch({ ...action, name: 'foo', domain: 'test' }),
      value: { foo: 42 },
    });
    expect(c.getBlock().lastPutTime).toBe(null);
    await c.put();
    expect(c.getBlock().lastPutTime).not.toBe(null);

    const obj = await m.dispatch({
      type: 'GetBlock',
      domain: 'test',
      name: 'foo',
      id: c.id,
    });

    expect(obj.value.foo).toEqual(42);
  });
});

describe('observing', () => {
  test('observe obj', async () => {
    const m = startMemoryDataSource({ domain: 'test' });
    const obj1 = await m.dispatch({
      type: 'PutBlock',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    const c = createCloudBlock({
      onNamedDispatch: action =>
        m.dispatch({ ...action, name: 'foo', domain: 'test' }),
      id: obj1.id,
    });

    let lastObserved = undefined;
    c.observe.subscribe({
      next: e => {
        lastObserved = e;
      },
    });
    expect(lastObserved.value).toEqual(undefined);
    await c.fetch();
    expect(lastObserved.value.foo).toEqual('bar');
  });
  test('observe value', async () => {
    const m = startMemoryDataSource({ domain: 'test' });
    const obj1 = await m.dispatch({
      type: 'PutBlock',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    const c = createCloudBlock({
      onNamedDispatch: action =>
        m.dispatch({ ...action, name: 'foo', domain: 'test' }),
      id: obj1.id,
    });

    let lastObserved = undefined;
    c.observeValue.subscribe({
      next: e => {
        lastObserved = e;
      },
    });
    expect(lastObserved).toEqual(undefined);
    await c.fetch();
    expect(lastObserved.foo).toEqual('bar');
  });
});
