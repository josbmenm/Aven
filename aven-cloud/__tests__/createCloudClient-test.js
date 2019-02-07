import startMemoryDataSource from '../startMemoryDataSource';
import createCloudClient from '../createCloudClient';

import dataSourceTests from './dataSourceTests';

describe('create client generic behavior', () => {
  test('passes arbitrary actions to dispatch', () => {
    let lastDispatched = null;
    const c = createCloudClient({
      domain: 'test',
      dataSource: {
        dispatch: a => {
          lastDispatched = a;
        },
        close: () => {},
        observeDoc: () => {},
      },
    });
    c.dispatch({ type: 'my action' });
    expect(lastDispatched.type).toEqual('my action');
  });
});

describe('client doc behavior', () => {
  test('gets docs', async () => {
    const m = startMemoryDataSource({ domain: 'd' });
    const c = createCloudClient({ dataSource: m, domain: 'd' });
    const doc = c.get('foo');
    expect(doc.getState().id).toBe(null);
    expect(doc.getName()).toBe('foo');
    await doc.fetch();
    const first = await m.dispatch({
      type: 'PutDocValue',
      name: 'foo',
      domain: 'd',
      value: { count: 12 },
    });
    await m.dispatch({
      type: 'PutDoc',
      name: 'foo',
      domain: 'd',
      id: first.id,
    });
    await doc.fetch();
    expect(doc.getState().id).toBe(first.id);
  });

  test('gets doc values', async () => {
    const m = startMemoryDataSource({ domain: 'd' });
    const c = createCloudClient({ dataSource: m, domain: 'd' });

    const doc = c.get('foo');
    expect(doc.id).toBe(undefined);
    expect(doc.getName()).toBe('foo');
    await doc.fetch();
    const first = await m.dispatch({
      type: 'PutDocValue',
      name: 'foo',
      domain: 'd',
      value: { count: 12 },
    });
    await m.dispatch({
      type: 'PutDoc',
      name: 'foo',
      domain: 'd',
      id: first.id,
    });
    await doc.fetchValue();
    expect(doc.getValue()).toEqual({ count: 12 });
  });

  test('deduplicates gotten docs', async () => {
    const m = startMemoryDataSource({ domain: 'd' });
    const c = createCloudClient({ dataSource: m, domain: 'd' });
    const r0 = c.get('foo');
    const r1 = c.get('foo');
    expect(r0).toBe(r1);
  });

  test('doc posting', async () => {
    const m = startMemoryDataSource({ domain: 'd' });
    const c = createCloudClient({ dataSource: m, domain: 'd' });
    const doc = c.get('foo');
    let docsList = null;
    await doc.put({
      hello: 'world',
    });
    docsList = await m.dispatch({
      type: 'GetDocValue',
      domain: 'd',
      name: 'foo/_children',
    });
    expect(docsList.value.length).toEqual(0);
    const postedDoc = doc.post();
    expect(postedDoc.getFullName().match(/^foo\/(.+)$/)).not.toBeNull();
    await postedDoc.put({ some: 'data' });
    docsList = await m.dispatch({
      type: 'GetDocValue',
      domain: 'd',
      name: 'foo/_children',
    });
    expect(docsList.value.length).toEqual(1);
    const bar = doc.get('bar');
    await bar.put({ woah: 42 });
    docsList = await m.dispatch({
      type: 'GetDocValue',
      domain: 'd',
      name: 'foo/_children',
    });
    expect(docsList.value.length).toEqual(2);
    expect(docsList.value.indexOf('bar')).not.toEqual(-1);
    await bar.destroy();
    docsList = await m.dispatch({
      type: 'GetDocValue',
      domain: 'd',
      name: 'foo/_children',
    });
    expect(docsList.value.length).toEqual(1);
    expect(docsList.value.indexOf('bar')).toEqual(-1);
  });
  test('doc getting', async () => {
    const m = startMemoryDataSource({ domain: 'd' });
    const c = createCloudClient({ dataSource: m, domain: 'd' });
    const fooDoc = c.get('foo');
    const fooBarDoc = c.get('foo/bar');
    const fooBarChained = fooDoc.get('bar');
    expect(fooBarDoc).toEqual(fooBarChained);
  });
});

describe('block fetching', () => {
  test('fetches blocks with doc#blockid', async () => {
    const m = startMemoryDataSource({ domain: 'd' });
    const first = await m.dispatch({
      type: 'PutDocValue',
      name: 'foo',
      domain: 'd',
      value: { count: 1 },
    });
    const second = await m.dispatch({
      type: 'PutDocValue',
      name: 'foo',
      domain: 'd',
      value: { count: 2 },
    });
    const c = createCloudClient({ dataSource: m, domain: 'd' });
    const block1 = c.get('foo#' + first.id);
    await block1.fetchValue();
    const result = block1.getValue();
    expect(result.count).toEqual(1);
    expect(block1.getReference()).toMatchObject({
      type: 'BlockReference',
      id: first.id,
    });
  });
  test('fetches nested blocks with foo/bar#blockid', async () => {
    const m = startMemoryDataSource({ domain: 'd' });
    const first = await m.dispatch({
      type: 'PutDocValue',
      name: 'foo/bar',
      domain: 'd',
      value: { count: 1 },
    });
    const second = await m.dispatch({
      type: 'PutDocValue',
      name: 'foo/bar',
      domain: 'd',
      value: { count: 2 },
    });
    const c = createCloudClient({ dataSource: m, domain: 'd' });
    const block1 = c.get('foo/bar#' + first.id);
    expect(block1).not.toBeNull();
    await block1.fetchValue();
    const result = block1.getValue();
    expect(result.count).toEqual(1);
    expect(block1.getReference()).toMatchObject({
      type: 'BlockReference',
      id: first.id,
    });
  });
});

describe('eval', () => {
  test.skip('basic eval value', async () => {
    const dataSource = startMemoryDataSource({ domain: 'd' });
    const c = createCloudClient({ dataSource, domain: 'd' });
    await dataSource.dispatch({
      type: 'PutDocValue',
      domain: 'd',
      name: 'foo',
      value: 2,
    });
    await dataSource.dispatch({
      type: 'PutDocValue',
      domain: 'd',
      name: 'squared',
      value: {
        type: 'LambdaFunction',
        code: 'a => a * a',
      },
    });
    const s = c.get('foo^squared');
    await s.fetchValue();
    const result = s.getValue();
    expect(result).toBe(4);
  });
});

describe('onDocMiss', () => {
  test('basic doc miss example', async () => {
    const m = startMemoryDataSource({ domain: 'd' });
    const missedDocs = [];
    async function onDocMiss(docName) {
      missedDocs.push(docName);
      const value = { yourName: docName };
      return {
        value,
      };
    }
    const c = createCloudClient({ dataSource: m, domain: 'd', onDocMiss });
    const foo = c.get('foo');
    await foo.fetchValue();
    const result = foo.getValue();
    expect(missedDocs.length).toBe(1);
    expect(result.yourName).toEqual('foo');
  });
});

describe('client doc map', () => {
  test('fetches mapped docs', async () => {
    const m = startMemoryDataSource({ domain: 'd' });
    const first = await m.dispatch({
      type: 'PutDocValue',
      name: 'foo',
      domain: 'd',
      value: { count: 1 },
    });
    const second = await m.dispatch({
      type: 'PutDocValue',
      name: 'foo',
      domain: 'd',
      value: { count: 2 },
    });
    await m.dispatch({
      type: 'PutDoc',
      name: 'foo',
      domain: 'd',
      id: first.id,
    });
    const c = createCloudClient({ dataSource: m, domain: 'd' });
    const mapped = c
      .get('foo')
      .map(o => o && { squaredCount: o.count * o.count });
    await mapped.fetchValue();
    expect(mapped.getValue().squaredCount).toEqual(1);
    await m.dispatch({
      type: 'PutDoc',
      name: 'foo',
      domain: 'd',
      id: second.id,
    });
    await mapped.fetchValue();
    expect(mapped.getValue().squaredCount).toEqual(4);
  });

  test('fetches chained mapped docs', async () => {
    const m = startMemoryDataSource({ domain: 'd' });
    const first = await m.dispatch({
      type: 'PutDocValue',
      name: 'foo',
      domain: 'd',
      value: { count: 1 },
    });
    const second = await m.dispatch({
      type: 'PutDocValue',
      name: 'foo',
      domain: 'd',
      value: { count: 2 },
    });
    await m.dispatch({
      type: 'PutDoc',
      name: 'foo',
      domain: 'd',
      id: first.id,
    });
    const c = createCloudClient({ dataSource: m, domain: 'd' });
    const mapped = c
      .get('foo')
      .map(o => o && { squaredCount: o.count * o.count })
      .map(o => o && { squaredSquaredCount: o.squaredCount * o.squaredCount });
    await mapped.fetchValue();
    expect(mapped.getValue().squaredSquaredCount).toEqual(1);
    await m.dispatch({
      type: 'PutDoc',
      name: 'foo',
      domain: 'd',
      id: second.id,
    });
    await mapped.fetchValue();
    expect(mapped.getValue().squaredSquaredCount).toEqual(16);
  });

  test('fetches expand docs', async () => {
    const m = startMemoryDataSource({ domain: 'd' });
    const firstCount = await m.dispatch({
      type: 'PutDocValue',
      name: 'foo',
      domain: 'd',
      value: { count: 12 },
    });
    const first = await m.dispatch({
      type: 'PutDocValue',
      name: 'foo',
      domain: 'd',
      value: { countObj: firstCount.id },
    });
    const secondCount = await m.dispatch({
      type: 'PutDocValue',
      name: 'foo',
      domain: 'd',
      value: { count: 42 },
    });
    const second = await m.dispatch({
      type: 'PutDocValue',
      name: 'foo',
      domain: 'd',
      value: { countObj: secondCount.id },
    });
    await m.dispatch({
      type: 'PutDoc',
      name: 'foo',
      domain: 'd',
      id: first.id,
    });
    const c = createCloudClient({ dataSource: m, domain: 'd' });
    const expanded = c
      .get('foo')
      .expand((value, doc) => value && { great: doc.getBlock(value.countObj) });
    await expanded.fetchValue();
    expect(expanded.getValue().great.count).toEqual(12);
    await m.dispatch({
      type: 'PutDoc',
      name: 'foo',
      domain: 'd',
      id: second.id,
    });
    await expanded.fetchValue();
    expect(expanded.getValue().great.count).toEqual(42);
  });
});

describe.skip('client behaves as data source', async () => {
  async function startTestDataSource(options = {}) {
    const dataSource = startMemoryDataSource({ domain: 'test', ...options });
    const client = createCloudClient({ dataSource, domain: 'test' });
    return client;
  }

  dataSourceTests(startTestDataSource);
});
