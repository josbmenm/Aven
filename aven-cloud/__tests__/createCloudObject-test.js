import startMemoryDataSource from '../startMemoryDataSource';
import createCloudObject from '../createCloudObject';

describe('object generic behavior', () => {
  test('handles creation with empty value', () => {
    const obj = createCloudObject({
      dataSource: {},
      onNamedDispatch: () => {},
      id: 'asdf1234',
    });
    expect(obj.id).toBe('asdf1234');
  });
  test('fails on creation without onNamedDispatch', () => {
    expect(() =>
      createCloudObject({
        value: { foo: 42 },
      })
    ).toThrow();
  });
  test('fails on creation without value or id', () => {
    expect(() =>
      createCloudObject({
        onNamedDispatch: () => {},
      })
    ).toThrow();
  });
  test('handles creation with value', () => {
    const obj = createCloudObject({
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
      type: 'PutObject',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    const c = createCloudObject({
      onNamedDispatch: action =>
        m.dispatch({ ...action, name: 'foo', domain: 'test' }),
      id,
    });
    expect(c.getValue()).toEqual(undefined);
    expect(c.getObject().lastFetchTime).toBe(null);
    await c.fetch();
    expect(c.getObject().lastFetchTime).not.toBe(null);
    expect(c.getValue().foo).toEqual('bar');
  });
  test('fetches null objects', async () => {
    const m = startMemoryDataSource({ domain: 'test' });
    const { id } = await m.dispatch({
      type: 'PutObject',
      domain: 'test',
      name: 'foo',
      value: null,
    });
    const c = createCloudObject({
      onNamedDispatch: action =>
        m.dispatch({ ...action, name: 'foo', domain: 'test' }),
      id,
    });
    expect(c.getValue()).toEqual(undefined);
    expect(c.getObject().lastFetchTime).toBe(null);
    await c.fetch();
    expect(c.getValue()).toEqual(null);
    expect(c.getObject().lastFetchTime).not.toBe(null);
  });
  test('puts objects', async () => {
    const m = startMemoryDataSource({ domain: 'test' });

    const c = createCloudObject({
      onNamedDispatch: action =>
        m.dispatch({ ...action, name: 'foo', domain: 'test' }),
      value: { foo: 42 },
    });
    expect(c.getObject().lastPutTime).toBe(null);
    await c.put();
    expect(c.getObject().lastPutTime).not.toBe(null);

    const obj = await m.dispatch({
      type: 'GetObject',
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
      type: 'PutObject',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    const c = createCloudObject({
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
      type: 'PutObject',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    const c = createCloudObject({
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
