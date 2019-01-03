import startMemoryDataSource from '../startMemoryDataSource';
import dataSourceTests from './dataSourceTests';

beforeAll(async () => {});

async function startTestDataSource(options) {
  const ds = startMemoryDataSource({ domain: 'test' });
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

describe('observing docs', () => {
  test('puts doc fails when an object is missing', async () => {
    const ds = startMemoryDataSource({ domain: 'test' });
    await expect(
      ds.dispatch({ type: 'PutDoc', domain: 'test', objectId: 'foo' }),
    ).rejects.toThrow();
  });
  test('observe doc works', async () => {
    const ds = startMemoryDataSource({ domain: 'test' });
    const obj1 = await ds.dispatch({
      type: 'PutBlock',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    const obj2 = await ds.dispatch({
      type: 'PutBlock',
      domain: 'test',
      name: 'foo',
      value: { foo: 'baz' },
    });
    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo',
      id: obj1.id,
    });
    const obs = await ds.observeDoc('test', 'foo');
    let lastObserved = undefined;
    obs.subscribe({
      next: newVal => {
        lastObserved = newVal;
      },
    });
    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo',
      id: obj2.id,
    });
    expect(lastObserved.id).toEqual(obj2.id);
  });

  test('observe root doc list works', async () => {
    const ds = startMemoryDataSource({ domain: 'test' });
    const obs = await ds.observeDoc('test', '_children');
    let lastObserved = undefined;
    obs.subscribe({
      next: newVal => {
        lastObserved = newVal;
      },
    });
    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo',
      id: null,
    });
    expect(lastObserved.value).toEqual(['foo']);
    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo/bar',
      id: null,
    });
    expect(lastObserved.value).toEqual(['foo']);
    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'baz',
      id: null,
    });
    expect(lastObserved.value).toEqual(['foo', 'baz']);
  });

  test('observe named doc list works', async () => {
    const ds = startMemoryDataSource({ domain: 'test' });
    const obs = await ds.observeDoc('test', 'foo/_children');
    let lastObserved = undefined;
    obs.subscribe({
      next: newVal => {
        lastObserved = newVal;
      },
    });
    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo',
      id: null,
    });
    expect(lastObserved.value).toEqual([]);
    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo/bar',
      id: null,
    });
    expect(lastObserved.value).toEqual(['bar']);
    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo/baz',
      id: null,
    });
    expect(lastObserved.value).toEqual(['bar', 'baz']);
    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo/baz/boo',
      id: null,
    });
    expect(lastObserved.value).toEqual(['bar', 'baz']);
    await ds.dispatch({
      type: 'DestroyDoc',
      domain: 'test',
      name: 'foo/baz',
      id: null,
    });
    expect(lastObserved.value).toEqual(['bar']);
    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo/baz',
      id: null,
    });
    expect(lastObserved.value).toEqual(['bar', 'baz']);
  });

  test('observe cleanup works', async () => {
    const ds = startMemoryDataSource({ domain: 'test' });
    const obj1 = await ds.dispatch({
      type: 'PutBlock',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    const obj2 = await ds.dispatch({
      type: 'PutBlock',
      domain: 'test',
      name: 'foo',
      value: { foo: 'baz' },
    });
    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo',
      id: obj1.id,
    });
    const obs = await ds.observeDoc('test', 'foo');
    let lastObserved = undefined;
    const subs = obs.subscribe({
      next: newVal => {
        lastObserved = newVal;
      },
    });
    expect(lastObserved.id).toEqual(obj1.id);
    subs.unsubscribe();
    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo',
      id: obj2.id,
    });
    expect(lastObserved.id).toEqual(obj1.id);
  });

  test('observe same doc multiple times', async () => {
    const ds = startMemoryDataSource({ domain: 'test' });
    const obj1 = await ds.dispatch({
      type: 'PutBlock',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    const obj2 = await ds.dispatch({
      type: 'PutBlock',
      domain: 'test',
      name: 'foo',
      value: { foo: 'baz' },
    });
    const obj3 = await ds.dispatch({
      type: 'PutBlock',
      domain: 'test',
      name: 'foo',
      value: { foo: 42 },
    });
    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo',
      id: obj1.id,
    });
    const obs1 = await ds.observeDoc('test', 'foo');
    const obs2 = await ds.observeDoc('test', 'foo');
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
      type: 'PutDoc',
      domain: 'test',
      name: 'foo',
      id: obj2.id,
    });
    expect(lastObserved1.id).toEqual(obj2.id);
    expect(lastObserved2.id).toEqual(obj2.id);

    subs1.unsubscribe();
    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo',
      id: obj3.id,
    });
    expect(lastObserved1.id).toEqual(obj2.id);
    expect(lastObserved2.id).toEqual(obj3.id);
    subs2.unsubscribe();
  });
});
