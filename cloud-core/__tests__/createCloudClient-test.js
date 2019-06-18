import createMemoryStorageSource from '../createMemoryStorageSource';
import createCloudClient from '../createCloudClient';
import { setMaxListDocs } from '../maxListDocs';

import sourceTests from './sourceTests';

describe('create client generic behavior', () => {
  it('passes arbitrary actions to dispatch', () => {
    let lastDispatched = null;
    const c = createCloudClient({
      domain: 'test',
      source: {
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
  it('gets docs', async () => {
    const m = createMemoryStorageSource({ domain: 'd' });
    const c = createCloudClient({ source: m, domain: 'd' });
    const doc = c.get('foo');
    expect(doc.getState().id).toBe(undefined);
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

  it('gets doc values', async () => {
    const m = createMemoryStorageSource({ domain: 'd' });
    const c = createCloudClient({ source: m, domain: 'd' });

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
    await doc.loadValue();
    expect(doc.getValue()).toEqual({ count: 12 });
  });

  it('deduplicates gotten docs', async () => {
    const m = createMemoryStorageSource({ domain: 'd' });
    const c = createCloudClient({ source: m, domain: 'd' });
    const r0 = c.get('foo');
    const r1 = c.get('foo');
    expect(r0).toBe(r1);
  });

  it('doc lists', async () => {
    const m = createMemoryStorageSource({ domain: 'd' });
    const c = createCloudClient({ source: m, domain: 'd' });
    await c.get('foo').put({});
    await c.get('bar').put({});
    let lastObserved = null;
    c.observeChildren.subscribe({
      next: val => {
        lastObserved = val;
      },
    });
    await justASec();
    expect(lastObserved.length).toBe(2);
    expect(lastObserved[0].getFullName()).toBe('bar');
  });

  it('doc paginated lists', async () => {
    setMaxListDocs(2);
    const m = createMemoryStorageSource({ domain: 'd' });
    const c = createCloudClient({ source: m, domain: 'd' });
    await c.get('foo').put({});
    await c.get('bar').put({});
    await c.get('baz').put({});

    let lastObserved = null;
    c.observeChildren.subscribe({
      next: val => {
        lastObserved = val;
      },
    });
    await justASec();
    expect(lastObserved.length).toBe(3);
    expect(lastObserved[2].getFullName()).toBe('foo');
  });

  it('doc list subscriptions, unsubscrbie, resubscribe', async () => {
    const m = createMemoryStorageSource({ domain: 'd' });
    const c = createCloudClient({ source: m, domain: 'd' });
    await c.get('foo').put({});
    await c.get('bar').put({});
    let lastObserved = null;
    let subs = c.observeChildren.subscribe({
      next: val => {
        lastObserved = val;
      },
    });
    await justASec();
    expect(lastObserved.length).toBe(2);
    await m.dispatch({
      type: 'PutDocValue',
      domain: 'd',
      value: 'whatever',
      name: 'baz',
    });
    await justASec();
    expect(lastObserved.length).toBe(3);
    await m.dispatch({
      type: 'DestroyDoc',
      domain: 'd',
      name: 'baz',
    });
    await justASec();
    expect(lastObserved.length).toBe(2);

    await m.dispatch({
      type: 'DestroyDoc',
      domain: 'd',
      name: 'foo',
    });
    await justASec();
    expect(lastObserved.length).toBe(1);
    subs.unsubscribe();
    await m.dispatch({
      type: 'DestroyDoc',
      domain: 'd',
      name: 'bar',
    });

    await justASec();
    expect(lastObserved.length).toBe(1);
    lastObserved = null;
    subs = c.observeChildren.subscribe({
      next: val => {
        lastObserved = val;
      },
    });
    await justASec();
    expect(lastObserved.length).toBe(0);
  });

  it('doc posting', async () => {
    const m = createMemoryStorageSource({ domain: 'd' });
    const c = createCloudClient({ source: m, domain: 'd' });
    const doc = c.get('foo');
    let docsList = null;
    await doc.put({
      hello: 'world',
    });
    docsList = await m.dispatch({
      type: 'ListDocs',
      domain: 'd',
      parentName: 'foo',
    });
    expect(docsList.docs.length).toEqual(0);
    const postedDoc = doc.post();
    expect(postedDoc.getFullName().match(/^foo\/(.+)$/)).not.toBeNull();
    await postedDoc.put({ some: 'data' });
    docsList = await m.dispatch({
      type: 'ListDocs',
      domain: 'd',
      parentName: 'foo',
    });
    expect(docsList.docs.length).toEqual(1);
    const bar = doc.get('bar');
    await bar.put({ woah: 42 });
    docsList = await m.dispatch({
      type: 'ListDocs',
      domain: 'd',
      parentName: 'foo',
    });
    expect(docsList.docs.length).toEqual(2);
    expect(docsList.docs.indexOf('bar')).not.toEqual(-1);
    await bar.destroy();
    docsList = await m.dispatch({
      type: 'ListDocs',
      domain: 'd',
      parentName: 'foo',
    });
    expect(docsList.docs.length).toEqual(1);
    expect(docsList.docs.indexOf('bar')).toEqual(-1);
  });
  it('doc getting', async () => {
    const m = createMemoryStorageSource({ domain: 'd' });
    const c = createCloudClient({ source: m, domain: 'd' });
    const fooDoc = c.get('foo');
    const fooBarDoc = c.get('foo/bar');
    const fooBarChained = fooDoc.get('bar');
    expect(fooBarDoc).toEqual(fooBarChained);
  });
});

describe('block fetching', () => {
  it('fetches blocks with doc#blockid', async () => {
    const m = createMemoryStorageSource({ domain: 'd' });
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
    const c = createCloudClient({ source: m, domain: 'd' });
    const block1 = c.get('foo#' + first.id);
    await block1.loadValue();
    const result = block1.getValue();
    expect(result.count).toEqual(1);
    expect(block1.getReference()).toMatchObject({
      type: 'BlockReference',
      id: first.id,
    });
  });
  it('fetches nested blocks with foo/bar#blockid', async () => {
    const m = createMemoryStorageSource({ domain: 'd' });
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
    const c = createCloudClient({ source: m, domain: 'd' });
    const block1 = c.get('foo/bar#' + first.id);
    expect(block1).not.toBeNull();
    await block1.loadValue();
    const result = block1.getValue();
    expect(result.count).toEqual(1);
    expect(block1.getReference()).toMatchObject({
      type: 'BlockReference',
      id: first.id,
    });
  });
});

describe('eval', () => {
  it('basic eval value', async () => {
    const source = createMemoryStorageSource({ domain: 'd' });
    const c = createCloudClient({ source, domain: 'd' });
    await source.dispatch({
      type: 'PutDocValue',
      domain: 'd',
      name: 'foo',
      value: 2,
    });
    await source.dispatch({
      type: 'PutDocValue',

      domain: 'd',
      name: 'squared',
      value: {
        type: 'LambdaFunction',
        code: '({value}) => value * value',
      },
    });
    const s = c.get('foo^squared');
    await s.loadValue();
    const result = s.getValue();
    expect(result).toBe(4);
  });
});

async function justASec(ms) {
  return new Promise(resolve => setTimeout(resolve, ms || 2));
}

function spyOnSource(ds) {
  const _observedActionCounts = {};
  return {
    ...ds,
    dispatch: async action => {
      const prevCount = _observedActionCounts[action.type] || 0;
      _observedActionCounts[action.type] = prevCount + 1;
      return await ds.dispatch(action);
    },
    _observedActionCounts,
  };
}

describe('cache behavior', () => {
  it('doc id cache during subscription', async () => {
    const m = spyOnSource(createMemoryStorageSource({ domain: 'd' }));
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
    const c = createCloudClient({ source: m, domain: 'd' });

    const doc = c.get('foo');
    expect(doc.isConnected.getValue()).toBe(false);
    let lastObserved = undefined;
    doc.observe.subscribe({
      next: v => {
        lastObserved = v;
      },
    });
    await justASec();
    expect(lastObserved.id).toEqual(first.id);

    await m.dispatch({
      type: 'PutDoc',
      name: 'foo',
      domain: 'd',
      id: second.id,
    });
    expect(doc.isConnected.getValue()).toBe(true);

    await doc.loadValue();

    expect(m._observedActionCounts.GetDoc || 0).toEqual(0);
  });
});

describe('eval/lambda behavior', () => {
  it('basic eval', async () => {
    const source = createMemoryStorageSource({ domain: 'd' });
    const c = createCloudClient({ source, domain: 'd' });
    await source.dispatch({
      type: 'PutDocValue',
      domain: 'd',
      name: 'foo',
      value: 2,
    });
    c.setLambda('squared', ({ value }) => {
      return value * value;
    });
    const s = c.get('foo^squared');
    await s.loadValue();
    expect(s.getValue()).toBe(4);
    await source.dispatch({
      type: 'PutDocValue',
      domain: 'd',
      name: 'foo',
      value: 3,
    });
    await s.loadValue();
    expect(s.getValue()).toBe(9);
  });
  it('basic eval, observed', async () => {
    const source = createMemoryStorageSource({ domain: 'd' });
    const c = createCloudClient({ source, domain: 'd' });
    await source.dispatch({
      type: 'PutDocValue',
      domain: 'd',
      name: 'foo',
      value: 2,
    });
    c.setLambda('squared', ({ value }) => {
      return value * value;
    });
    const s = c.get('foo^squared');
    let lastObserved = undefined;
    s.observeValue.subscribe({
      next: newVal => {
        lastObserved = newVal;
      },
    });
    await justASec();
    expect(lastObserved).toBe(4);
    await source.dispatch({
      type: 'PutDocValue',
      domain: 'd',
      name: 'foo',
      value: 3,
    });
    await justASec();
    expect(lastObserved).toBe(9);
  });
  it('basic multi-doc eval', async () => {
    const source = createMemoryStorageSource({ domain: 'd' });
    const c = createCloudClient({ source, domain: 'd' });
    await source.dispatch({
      type: 'PutDocValue',
      domain: 'd',
      name: 'foo',
      value: 2,
    });
    await source.dispatch({
      type: 'PutDocValue',
      domain: 'd',
      name: 'bar',
      value: 3,
    });
    c.setLambda(
      'byBar',
      ({ value }, d, cloud, getValue) => value * getValue(cloud.get('bar')),
    );
    const s = c.get('foo^byBar');
    await s.loadValue();
    expect(s.getValue()).toBe(6);
    await source.dispatch({
      type: 'PutDocValue',
      domain: 'd',
      name: 'foo',
      value: 3,
    });
    await s.loadValue();
    expect(s.getValue()).toBe(9);
  });

  it('recursive reducer eval', async () => {
    const source = createMemoryStorageSource({ domain: 'd' });
    const c = createCloudClient({ source, domain: 'd' });
    await source.dispatch({
      type: 'PutDocValue',
      domain: 'd',
      name: 'fooActions',
      value: { add: 'a' },
    });
    await source.dispatch({
      type: 'PutTransactionValue',
      domain: 'd',
      name: 'fooActions',
      value: { add: 'b' },
    });
    c.setLambda('fooReducer', ({ value }, doc, cloud, getValue) => {
      let state = [];
      if (!value) {
        return state;
      }
      let action = value;
      if (value.on && value.on.id) {
        const ancestorName =
          doc.getFullName() + '#' + value.on.id + '^fooReducer';
        state = getValue(cloud.get(ancestorName)) || [];
        action = value.value;
      }
      if (action.add) {
        return [...state, action.add];
      }
      if (action.remove) {
        return state.filter(v => v !== action.remove);
      }
      return state;
    });
    const s = c.get('fooActions^fooReducer');
    await s.loadValue();
    expect(s.getValue()).toEqual(['a', 'b']);
    await source.dispatch({
      type: 'PutTransactionValue',
      domain: 'd',
      name: 'fooActions',
      value: { remove: 'a' },
    });
    await s.loadValue();
    expect(s.getValue()).toEqual(['b']);
  });

  it('observe recursive reducer eval', async () => {
    const source = createMemoryStorageSource({ domain: 'd' });
    const c = createCloudClient({ source, domain: 'd' });
    await source.dispatch({
      type: 'PutDocValue',
      domain: 'd',
      name: 'fooActions',
      value: { add: 'a' },
    });
    await source.dispatch({
      type: 'PutTransactionValue',
      domain: 'd',
      name: 'fooActions',
      value: { add: 'b' },
    });
    c.setLambda('fooReducer', ({ value }, doc, cloud, getValue) => {
      let state = [];
      if (!value) {
        return state;
      }
      let action = value;
      if (value.on && value.on.id) {
        const ancestorName =
          doc.getFullName() + '#' + value.on.id + '^fooReducer';
        state = getValue(cloud.get(ancestorName)) || [];
        action = value.value;
      }
      if (action.add) {
        return [...state, action.add];
      }
      if (action.remove) {
        return state.filter(v => v !== action.remove);
      }
      return state;
    });
    const s = c.get('fooActions^fooReducer');
    let lastObserved = null;
    const subs = s.observeValue.subscribe({
      next: v => {
        lastObserved = v;
      },
    });
    await justASec();
    expect(lastObserved.length).toBe(2);
    await source.dispatch({
      type: 'PutTransactionValue',
      domain: 'd',
      name: 'fooActions',
      value: { remove: 'a' },
    });
    await justASec();
    expect(lastObserved.length).toBe(1);
    subs.unsubscribe();
    await source.dispatch({
      type: 'PutTransactionValue',
      domain: 'd',
      name: 'fooActions',
      value: { remove: 'b' },
    });
    await justASec();
    expect(lastObserved.length).toBe(1);
  });
});

describe('client doc map', () => {
  it('fetches mapped docs', async () => {
    const m = createMemoryStorageSource({ domain: 'd' });
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
    const c = createCloudClient({ source: m, domain: 'd' });
    const mapped = c
      .get('foo')
      .map(o => o && { squaredCount: o.count * o.count });
    await mapped.loadValue();
    expect(mapped.getValue().squaredCount).toEqual(1);
    await m.dispatch({
      type: 'PutDoc',
      name: 'foo',
      domain: 'd',
      id: second.id,
    });
    await mapped.loadValue();
    expect(mapped.getValue().squaredCount).toEqual(4);
  });

  it('fetches chained mapped docs', async () => {
    const m = createMemoryStorageSource({ domain: 'd' });
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
    const c = createCloudClient({ source: m, domain: 'd' });
    const mapped = c
      .get('foo')
      .map(o => o && { squaredCount: o.count * o.count })
      .map(o => o && { squaredSquaredCount: o.squaredCount * o.squaredCount });
    await mapped.loadValue();
    expect(mapped.getValue().squaredSquaredCount).toEqual(1);
    await m.dispatch({
      type: 'PutDoc',
      name: 'foo',
      domain: 'd',
      id: second.id,
    });
    await mapped.loadValue();
    expect(mapped.getValue().squaredSquaredCount).toEqual(16);
  });

  it('fetches expand docs', async () => {
    const m = createMemoryStorageSource({ domain: 'd' });
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
    const c = createCloudClient({ source: m, domain: 'd' });
    const expanded = c
      .get('foo')
      .expand((value, doc) => value && { great: doc.getBlock(value.countObj) });
    await expanded.loadValue();
    expect(expanded.getValue().great.count).toEqual(12);
    await m.dispatch({
      type: 'PutDoc',
      name: 'foo',
      domain: 'd',
      id: second.id,
    });
    await expanded.loadValue();
    expect(expanded.getValue().great.count).toEqual(42);
  });
});

describe('client behaves as source', () => {
  async function startTestSource(options = { domain: 'test' }) {
    const source = createMemoryStorageSource({
      domain: options.domain,
      ...options,
    });
    const client = createCloudClient({ source, domain: options.domain });
    return client;
  }

  sourceTests(startTestSource);
});
