import createMemoryStorageSource from '../createMemoryStorageSource';
import createCloudBlock from '../createCloudBlock';

describe('object generic behavior', () => {
  it('handles creation with empty value', () => {
    const obj = createCloudBlock({
      domain: 'test',
      onGetName: () => 'foo',
      source: {},
      id: 'asdf1234',
      dispatch: () => {},
    });
    expect(obj.id).toBe('asdf1234');
  });
  it('fails on creation without value or id', () => {
    expect(() =>
      createCloudBlock({
        domain: 'test',
        onGetName: () => 'foo',
        dispatch: () => {},
      }),

    ).toThrow();
  });
  it('handles creation with value', () => {
    const obj = createCloudBlock({
      domain: 'test',
      onGetName: () => 'foo',
      value: { foo: 42 },
      dispatch: () => {},
    });
    expect(obj.id).toBe(
      '080e64543b0bed8b2de186304bb1ed04d5d46b5c1c362e971ec99ad8194576fc',
    );
  });
});

describe('basic object DataSource interaction', () => {
  it('fetches blocks', async () => {
    const m = createMemoryStorageSource({ domain: 'test' });
    const { id } = await m.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    const c = createCloudBlock({
      dispatch: m.dispatch,
      onGetName: () => 'foo',
      domain: 'test',
      id,
    });
    expect(c.getValue()).toEqual(undefined);
    expect(c.getState().lastFetchTime).toBe(null);
    await c.fetch();
    expect(c.getState().lastFetchTime).not.toBe(null);
    expect(c.getValue().foo).toEqual('bar');
  });
  it('fetches null objects', async () => {
    const m = createMemoryStorageSource({ domain: 'test' });
    const { id } = await m.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: null,
    });
    const c = createCloudBlock({
      dispatch: m.dispatch,
      onGetName: () => 'foo',
      domain: 'test',
      id,
    });
    expect(c.getValue()).toEqual(undefined);
    expect(c.getState().lastFetchTime).toBe(null);
    await c.fetch();
    expect(c.getValue()).toEqual(null);
    expect(c.getState().lastFetchTime).not.toBe(null);
  });
});

describe('stream loading of a block', () => {
  it ('blah', () => {
    const m = createMemoryStorageSource({ domain: 'test' });
    const obj1 = await m.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },

    });
    const c = createCloudBlock({
      dispatch: m.dispatch,
      onGetName: () => 'foo',
      domain: 'test',
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

  })
})

describe('observing', () => {
  it('observe obj', async () => {
    const m = createMemoryStorageSource({ domain: 'test' });
    const obj1 = await m.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },

    });
    const c = createCloudBlock({
      dispatch: m.dispatch,
      onGetName: () => 'foo',
      domain: 'test',
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
  it('observe value', async () => {
    const m = createMemoryStorageSource({ domain: 'test' });
    const obj1 = await m.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    const c = createCloudBlock({
      dispatch: m.dispatch,
      onGetName: () => 'foo',
      domain: 'test',
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
