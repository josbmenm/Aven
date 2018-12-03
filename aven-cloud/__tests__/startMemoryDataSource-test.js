import startMemoryDataSource from '../startMemoryDataSource';

describe('basic data source setup', () => {
  test('throws when starting without a domain', () => {
    expect(() => {
      startMemoryDataSource({});
    }).toThrow();
  });
  test('gets status reports ready', async () => {
    const ds = startMemoryDataSource({ domain: 'test' });
    const status = await ds.dispatch({
      type: 'GetStatus',
    });
    expect(status.ready).toEqual(true);
  });
});

describe('object storage', () => {
  test('object put fails with invalid domain', async () => {
    const ds = startMemoryDataSource({ domain: 'test' });
    await expect(
      ds.dispatch({
        type: 'PutObject',
        domain: 'test2',
        value: { foo: 'bar' },
        name: 'foo',
      })
    ).rejects.toThrow();
  });
  test('object put fails with missing ref', async () => {
    const ds = startMemoryDataSource({ domain: 'test' });
    await expect(
      ds.dispatch({
        type: 'PutObject',
        domain: 'test',
        value: { foo: 'bar' },
      })
    ).rejects.toThrow();
  });

  test('puts objects without error', async () => {
    const ds = startMemoryDataSource({ domain: 'test' });
    const putResult = await ds.dispatch({
      type: 'PutObject',
      domain: 'test',
      value: { foo: 'bar' },
      name: 'foo',
    });
    expect(typeof putResult.id).toEqual('string');
  });
  test('puts and gets object', async () => {
    const ds = startMemoryDataSource({ domain: 'test' });
    const putResult = await ds.dispatch({
      type: 'PutObject',
      domain: 'test',
      value: { foo: 'bar' },
      name: 'foo',
    });
    const obj = await ds.dispatch({
      type: 'GetObject',
      domain: 'test',
      name: 'foo',
      id: putResult.id,
    });
    expect(obj.value.foo).toEqual('bar');
  });
  test('puts and gets null object', async () => {
    const ds = startMemoryDataSource({ domain: 'test' });
    const putResult = await ds.dispatch({
      type: 'PutObject',
      domain: 'test',
      name: 'foo',
      value: null,
    });
    const obj = await ds.dispatch({
      type: 'GetObject',
      domain: 'test',
      name: 'foo',
      id: putResult.id,
    });
    expect(obj.value).toEqual(null);
  });
});

describe('ref storage', () => {
  test('puts ref fails when an object is missing', async () => {
    const ds = startMemoryDataSource({ domain: 'test' });
    await expect(
      ds.dispatch({ type: 'PutRef', domain: 'test', objectId: 'foo' })
    ).rejects.toThrow();
  });
  test('puts ref works', async () => {
    const ds = startMemoryDataSource({ domain: 'test' });
    const obj = await ds.dispatch({
      type: 'PutObject',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    await ds.dispatch({
      type: 'PutRef',
      domain: 'test',
      name: 'foo',
      id: obj.id,
    });
    const ref = await ds.dispatch({
      type: 'GetRef',
      domain: 'test',
      name: 'foo',
    });
    expect(ref.id).toEqual(obj.id);

    const gotObj = await ds.dispatch({
      type: 'GetObject',
      domain: 'test',
      name: 'foo',
      id: ref.id,
    });
    expect(gotObj.value.foo).toEqual('bar');
  });
  test('get ref value works', async () => {
    const ds = startMemoryDataSource({ domain: 'test' });
    const obj = await ds.dispatch({
      type: 'PutObject',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    await ds.dispatch({
      type: 'PutRef',
      domain: 'test',
      name: 'foo',
      id: obj.id,
    });
    const ref = await ds.dispatch({
      type: 'GetRefValue',
      domain: 'test',
      name: 'foo',
    });
    expect(ref.value.foo).toEqual('bar');
  });
  test('get missing ref', async () => {
    const ds = startMemoryDataSource({ domain: 'test' });
    const ref = await ds.dispatch({
      type: 'GetRef',
      domain: 'test',
      name: 'foo',
    });
    expect(ref.id).toEqual(null);
  });
  test('destroy ref works', async () => {
    const ds = startMemoryDataSource({ domain: 'test' });
    const obj = await ds.dispatch({
      type: 'PutObject',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    await ds.dispatch({
      type: 'PutRef',
      domain: 'test',
      name: 'foo',
      id: obj.id,
    });
    await ds.dispatch({
      type: 'DestroyRef',
      domain: 'test',
      name: 'foo',
    });
    const ref = await ds.dispatch({
      type: 'GetRef',
      domain: 'test',
      name: 'foo',
    });
    expect(ref.id).toEqual(null);
    const refs = await ds.dispatch({
      type: 'ListRefs',
      domain: 'test',
    });
    expect(refs).toEqual([]);
  });
  test('list ref works', async () => {
    const ds = startMemoryDataSource({ domain: 'test' });
    let refs = null;
    refs = await ds.dispatch({
      type: 'ListRefs',
      domain: 'test',
    });
    expect(refs).toEqual([]);

    const obj = await ds.dispatch({
      type: 'PutObject',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    await ds.dispatch({
      type: 'PutRef',
      domain: 'test',
      name: 'foo',
      id: obj.id,
    });
    refs = await ds.dispatch({
      type: 'ListRefs',
      domain: 'test',
    });
    expect(refs).toEqual(['foo']);

    await ds.dispatch({
      type: 'PutRef',
      domain: 'test',
      name: 'bar',
      id: obj.id,
    });
    refs = await ds.dispatch({
      type: 'ListRefs',
      domain: 'test',
    });
    expect(refs).toEqual(['foo', 'bar']);
  });

  test('list object works', async () => {
    const ds = startMemoryDataSource({ domain: 'test' });
    let objs = null;
    objs = await ds.dispatch({
      type: 'GetRefValue',
      domain: 'test',
      name: '_objects',
    });
    expect(objs.value).toEqual([]);

    const obj = await ds.dispatch({
      type: 'PutObject',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });

    objs = await ds.dispatch({
      type: 'GetRefValue',
      domain: 'test',
      name: '_objects',
    });
    expect(objs.value).toEqual([obj.id]);
  });

  test('list object of ref works', async () => {
    const ds = startMemoryDataSource({ domain: 'test' });
    let objs = null;
    objs = await ds.dispatch({
      type: 'GetRefValue',
      domain: 'test',
      name: 'foo/_objects',
    });
    expect(objs.value).toEqual([]);

    await ds.dispatch({
      type: 'PutObject',
      domain: 'test',
      name: 'bar',
      value: { foo: 'bar' },
    });
    const o1 = await ds.dispatch({
      type: 'PutObject',
      domain: 'test',
      name: 'foo',
      value: { foo: 'foo' },
    });
    const o2 = await ds.dispatch({
      type: 'PutObject',
      domain: 'test',
      name: 'foo',
      value: { foo: 'two' },
    });

    objs = await ds.dispatch({
      type: 'GetRefValue',
      domain: 'test',
      name: 'foo/_objects',
    });
    expect(objs.value).toEqual([o1.id, o2.id]);
  });

  test('list object of ref cascades correctly', async () => {
    const ds = startMemoryDataSource({ domain: 'test' });
    let objs = null;
    objs = await ds.dispatch({
      type: 'GetRefValue',
      domain: 'test',
      name: 'foo/_objects',
    });
    expect(objs.value).toEqual([]);

    await ds.dispatch({
      type: 'PutObject',
      domain: 'test',
      name: 'bar',
      value: { foo: 'bar' },
    });
    const o1 = await ds.dispatch({
      type: 'PutObject',
      domain: 'test',
      name: 'foo',
      value: { foo: 'foo' },
    });
    const o2 = await ds.dispatch({
      type: 'PutObject',
      domain: 'test',
      name: 'foo/bar',
      value: { foo: 'two' },
    });

    objs = await ds.dispatch({
      type: 'GetRefValue',
      domain: 'test',
      name: 'foo/_objects',
    });
    expect(objs.value).toEqual([o1.id, o2.id]);
  });

  test('list ref works works with GetValue _refs', async () => {
    const ds = startMemoryDataSource({ domain: 'test' });
    let refs = null;
    refs = await ds.dispatch({
      type: 'GetRefValue',
      domain: 'test',
      name: '_refs',
    });
    expect(refs.value).toEqual([]);

    const obj = await ds.dispatch({
      type: 'PutObject',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    await ds.dispatch({
      type: 'PutRef',
      domain: 'test',
      name: 'foo',
      id: null,
    });
    refs = await ds.dispatch({
      type: 'GetRefValue',
      domain: 'test',
      name: '_refs',
    });
    expect(refs.value).toEqual(['foo']);

    await ds.dispatch({
      type: 'PutRef',
      domain: 'test',
      name: 'bar',
      id: obj.id,
    });
    refs = await ds.dispatch({
      type: 'GetRefValue',
      domain: 'test',
      name: '_refs',
    });
    expect(refs.value).toEqual(['foo', 'bar']);

    await ds.dispatch({
      type: 'DestroyRef',
      domain: 'test',
      name: 'foo',
    });
    refs = await ds.dispatch({
      type: 'GetRefValue',
      domain: 'test',
      name: '_refs',
    });
    expect(refs.value).toEqual(['bar']);
  });
});

describe('parent child refs', () => {
  test('can list with parents', async () => {
    const ds = startMemoryDataSource({ domain: 'test' });
    let refs = null;
    refs = await ds.dispatch({
      type: 'ListRefs',
      domain: 'test',
    });
    expect(refs).toEqual([]);

    const obj = await ds.dispatch({
      type: 'PutObject',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    await ds.dispatch({
      type: 'PutRef',
      domain: 'test',
      name: 'foo',
      id: obj.id,
    });

    await ds.dispatch({
      type: 'PutRef',
      domain: 'test',
      name: 'foo/bar',
      id: obj.id,
    });

    await ds.dispatch({
      type: 'PutRef',
      domain: 'test',
      name: 'foo/bar/boo',
      id: obj.id,
    });

    await ds.dispatch({
      type: 'PutRef',
      domain: 'test',
      name: 'foo/baz',
      id: obj.id,
    });

    refs = await ds.dispatch({
      type: 'ListRefs',
      domain: 'test',
      parentName: 'foo',
    });
    expect(refs).toEqual(['bar', 'baz']);

    refs = await ds.dispatch({
      type: 'ListRefs',
      domain: 'test',
      parentName: 'foo/bar',
    });
    expect(refs).toEqual(['boo']);

    refs = await ds.dispatch({
      type: 'ListRefs',
      domain: 'test',
    });
    expect(refs).toEqual(['foo']);
  });
  test('can destroy parent refs and children go away', async () => {
    const ds = startMemoryDataSource({ domain: 'test' });
    const obj = await ds.dispatch({
      type: 'PutObject',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    await ds.dispatch({
      type: 'PutRef',
      domain: 'test',
      name: 'foo',
      id: obj.id,
    });
    await ds.dispatch({
      type: 'PutRef',
      domain: 'test',
      name: 'foo/bar',
      id: obj.id,
    });
    await ds.dispatch({
      type: 'DestroyRef',
      domain: 'test',
      name: 'foo',
    });
    const ref = await ds.dispatch({
      type: 'GetRef',
      domain: 'test',
      name: 'foo/bar',
    });
    expect(ref.id).toEqual(null);
  });

  test('list child refs only with GetValue _refs', async () => {
    const ds = startMemoryDataSource({ domain: 'test' });
    let refs = null;

    await ds.dispatch({
      type: 'PutRef',
      domain: 'test',
      name: 'foo',
      id: null,
    });
    await ds.dispatch({
      type: 'PutRef',
      domain: 'test',
      name: 'foo/bar',
      id: null,
    });
    await ds.dispatch({
      type: 'PutRef',
      domain: 'test',
      name: 'foo/boo',
      id: null,
    });
    await ds.dispatch({
      type: 'PutRef',
      domain: 'test',
      name: 'foo/bar/baz',
      id: null,
    });
    refs = await ds.dispatch({
      type: 'GetRefValue',
      domain: 'test',
      name: '_refs',
    });
    expect(refs.value).toEqual(['foo']);

    refs = await ds.dispatch({
      type: 'GetRefValue',
      domain: 'test',
      name: 'foo/_refs',
    });
    expect(refs.value).toEqual(['bar', 'boo']);

    refs = await ds.dispatch({
      type: 'GetRefValue',
      domain: 'test',
      name: 'foo/bar/_refs',
    });
    expect(refs.value).toEqual(['baz']);
  });
});

describe('observing refs', () => {
  test('puts ref fails when an object is missing', async () => {
    const ds = startMemoryDataSource({ domain: 'test' });
    await expect(
      ds.dispatch({ type: 'PutRef', domain: 'test', objectId: 'foo' })
    ).rejects.toThrow();
  });
  test('observe ref works', async () => {
    const ds = startMemoryDataSource({ domain: 'test' });
    const obj1 = await ds.dispatch({
      type: 'PutObject',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    const obj2 = await ds.dispatch({
      type: 'PutObject',
      domain: 'test',
      name: 'foo',
      value: { foo: 'baz' },
    });
    await ds.dispatch({
      type: 'PutRef',
      domain: 'test',
      name: 'foo',
      id: obj1.id,
    });
    const obs = await ds.observeRef('test', 'foo');
    let lastObserved = undefined;
    obs.subscribe({
      next: newVal => {
        lastObserved = newVal;
      },
    });
    await ds.dispatch({
      type: 'PutRef',
      domain: 'test',
      name: 'foo',
      id: obj2.id,
    });
    expect(lastObserved.id).toEqual(obj2.id);
  });

  test('observe root ref list works', async () => {
    const ds = startMemoryDataSource({ domain: 'test' });
    const obs = await ds.observeRef('test', '_refs');
    let lastObserved = undefined;
    obs.subscribe({
      next: newVal => {
        lastObserved = newVal;
      },
    });
    await ds.dispatch({
      type: 'PutRef',
      domain: 'test',
      name: 'foo',
      id: null,
    });
    expect(lastObserved.value).toEqual(['foo']);
    await ds.dispatch({
      type: 'PutRef',
      domain: 'test',
      name: 'foo/bar',
      id: null,
    });
    expect(lastObserved.value).toEqual(['foo']);
    await ds.dispatch({
      type: 'PutRef',
      domain: 'test',
      name: 'baz',
      id: null,
    });
    expect(lastObserved.value).toEqual(['foo', 'baz']);
  });

  test('observe named ref list works', async () => {
    const ds = startMemoryDataSource({ domain: 'test' });
    const obs = await ds.observeRef('test', 'foo/_refs');
    let lastObserved = undefined;
    obs.subscribe({
      next: newVal => {
        lastObserved = newVal;
      },
    });
    await ds.dispatch({
      type: 'PutRef',
      domain: 'test',
      name: 'foo',
      id: null,
    });
    expect(lastObserved.value).toEqual([]);
    await ds.dispatch({
      type: 'PutRef',
      domain: 'test',
      name: 'foo/bar',
      id: null,
    });
    expect(lastObserved.value).toEqual(['bar']);
    await ds.dispatch({
      type: 'PutRef',
      domain: 'test',
      name: 'foo/baz',
      id: null,
    });
    expect(lastObserved.value).toEqual(['bar', 'baz']);
    await ds.dispatch({
      type: 'PutRef',
      domain: 'test',
      name: 'foo/baz/boo',
      id: null,
    });
    expect(lastObserved.value).toEqual(['bar', 'baz']);
    await ds.dispatch({
      type: 'DestroyRef',
      domain: 'test',
      name: 'foo/baz',
      id: null,
    });
    expect(lastObserved.value).toEqual(['bar']);
    await ds.dispatch({
      type: 'PutRef',
      domain: 'test',
      name: 'foo/baz',
      id: null,
    });
    expect(lastObserved.value).toEqual(['bar', 'baz']);
  });

  test('observe cleanup works', async () => {
    const ds = startMemoryDataSource({ domain: 'test' });
    const obj1 = await ds.dispatch({
      type: 'PutObject',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    const obj2 = await ds.dispatch({
      type: 'PutObject',
      domain: 'test',
      name: 'foo',
      value: { foo: 'baz' },
    });
    await ds.dispatch({
      type: 'PutRef',
      domain: 'test',
      name: 'foo',
      id: obj1.id,
    });
    const obs = await ds.observeRef('test', 'foo');
    let lastObserved = undefined;
    const subs = obs.subscribe({
      next: newVal => {
        lastObserved = newVal;
      },
    });
    expect(lastObserved.id).toEqual(obj1.id);
    subs.unsubscribe();
    await ds.dispatch({
      type: 'PutRef',
      domain: 'test',
      name: 'foo',
      id: obj2.id,
    });
    expect(lastObserved.id).toEqual(obj1.id);
  });

  test('observe same ref multiple times', async () => {
    const ds = startMemoryDataSource({ domain: 'test' });
    const obj1 = await ds.dispatch({
      type: 'PutObject',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    const obj2 = await ds.dispatch({
      type: 'PutObject',
      domain: 'test',
      name: 'foo',
      value: { foo: 'baz' },
    });
    const obj3 = await ds.dispatch({
      type: 'PutObject',
      domain: 'test',
      name: 'foo',
      value: { foo: 42 },
    });
    await ds.dispatch({
      type: 'PutRef',
      domain: 'test',
      name: 'foo',
      id: obj1.id,
    });
    const obs1 = await ds.observeRef('test', 'foo');
    const obs2 = await ds.observeRef('test', 'foo');
    let lastObserved1 = undefined;
    let lastObserved2 = undefined;
    const subs1 = obs1.subscribe({
      next: newVal => {
        lastObserved1 = newVal;
      },
    });
    const subs2 = obs2.subscribe({
      next: newVal => {
        lastObserved2 = newVal;
      },
    });
    expect(lastObserved1.id).toEqual(obj1.id);
    expect(lastObserved2.id).toEqual(obj1.id);

    await ds.dispatch({
      type: 'PutRef',
      domain: 'test',
      name: 'foo',
      id: obj2.id,
    });
    expect(lastObserved1.id).toEqual(obj2.id);
    expect(lastObserved2.id).toEqual(obj2.id);

    subs1.unsubscribe();
    await ds.dispatch({
      type: 'PutRef',
      domain: 'test',
      name: 'foo',
      id: obj3.id,
    });
    expect(lastObserved1.id).toEqual(obj2.id);
    expect(lastObserved2.id).toEqual(obj3.id);
    subs2.unsubscribe();
  });
});

describe('synthetic _refs and _objects', () => {});
