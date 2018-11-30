import startMemoryDataSource from '../startMemoryDataSource';
import createCloudClient from '../createCloudClient';

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
        observeRef: () => {},
      },
    });
    c.dispatch({ type: 'my action' });
    expect(lastDispatched.type).toEqual('my action');
  });
});

describe('client ref behavior', () => {
  test('gets refs', async () => {
    const m = startMemoryDataSource({ domain: 'd' });
    const c = createCloudClient({ dataSource: m, domain: 'd' });
    const ref = c.getRef('foo');
    expect(ref.getState().id).toBe(null);
    expect(ref.name).toBe('foo');
    await ref.fetch();
    const first = await m.dispatch({
      type: 'PutObject',
      name: 'foo',
      domain: 'd',
      value: { count: 12 },
    });
    await m.dispatch({
      type: 'PutRef',
      name: 'foo',
      domain: 'd',
      id: first.id,
    });
    await ref.fetch();
    expect(ref.getState().id).toBe(first.id);
  });

  test('gets ref values', async () => {
    const m = startMemoryDataSource({ domain: 'd' });
    const c = createCloudClient({ dataSource: m, domain: 'd' });

    const ref = c.getRef('foo');
    expect(ref.id).toBe(undefined);
    expect(ref.name).toBe('foo');
    await ref.fetch();
    const first = await m.dispatch({
      type: 'PutObject',
      name: 'foo',
      domain: 'd',
      value: { count: 12 },
    });
    await m.dispatch({
      type: 'PutRef',
      name: 'foo',
      domain: 'd',
      id: first.id,
    });
    await ref.fetchValue();
    expect(ref.getValue()).toEqual({ count: 12 });
  });

  test('deduplicates gotten refs', async () => {
    const m = startMemoryDataSource({ domain: 'd' });
    const c = createCloudClient({ dataSource: m, domain: 'd' });
    const r0 = c.getRef('foo');
    const r1 = c.getRef('foo');
    expect(r0).toBe(r1);
  });
});

describe('client ref map', () => {
  test('fetches mapped refs', async () => {
    const m = startMemoryDataSource({ domain: 'd' });
    const first = await m.dispatch({
      type: 'PutObject',
      name: 'foo',
      domain: 'd',
      value: { count: 1 },
    });
    const second = await m.dispatch({
      type: 'PutObject',
      name: 'foo',
      domain: 'd',
      value: { count: 2 },
    });
    await m.dispatch({
      type: 'PutRef',
      name: 'foo',
      domain: 'd',
      id: first.id,
    });
    const c = createCloudClient({ dataSource: m, domain: 'd' });
    const mapped = c
      .getRef('foo')
      .map(o => o && { squaredCount: o.count * o.count });
    await mapped.fetchValue();
    expect(mapped.getValue().squaredCount).toEqual(1);
    await m.dispatch({
      type: 'PutRef',
      name: 'foo',
      domain: 'd',
      id: second.id,
    });
    await mapped.fetchValue();
    expect(mapped.getValue().squaredCount).toEqual(4);
  });

  test('fetches chained mapped refs', async () => {
    const m = startMemoryDataSource({ domain: 'd' });
    const first = await m.dispatch({
      type: 'PutObject',
      name: 'foo',
      domain: 'd',
      value: { count: 1 },
    });
    const second = await m.dispatch({
      type: 'PutObject',
      name: 'foo',
      domain: 'd',
      value: { count: 2 },
    });
    await m.dispatch({
      type: 'PutRef',
      name: 'foo',
      domain: 'd',
      id: first.id,
    });
    const c = createCloudClient({ dataSource: m, domain: 'd' });
    const mapped = c
      .getRef('foo')
      .map(o => o && { squaredCount: o.count * o.count })
      .map(o => o && { squaredSquaredCount: o.squaredCount * o.squaredCount });
    await mapped.fetchValue();
    expect(mapped.getValue().squaredSquaredCount).toEqual(1);
    await m.dispatch({
      type: 'PutRef',
      name: 'foo',
      domain: 'd',
      id: second.id,
    });
    await mapped.fetchValue();
    expect(mapped.getValue().squaredSquaredCount).toEqual(16);
  });

  test('fetches expand refs', async () => {
    const m = startMemoryDataSource({ domain: 'd' });
    const firstCount = await m.dispatch({
      type: 'PutObject',
      name: 'foo',
      domain: 'd',
      value: { count: 12 },
    });
    const first = await m.dispatch({
      type: 'PutObject',
      name: 'foo',
      domain: 'd',
      value: { countObj: firstCount.id },
    });
    const secondCount = await m.dispatch({
      type: 'PutObject',
      name: 'foo',
      domain: 'd',
      value: { count: 42 },
    });
    const second = await m.dispatch({
      type: 'PutObject',
      name: 'foo',
      domain: 'd',
      value: { countObj: secondCount.id },
    });
    await m.dispatch({
      type: 'PutRef',
      name: 'foo',
      domain: 'd',
      id: first.id,
    });
    const c = createCloudClient({ dataSource: m, domain: 'd' });
    const expanded = c
      .getRef('foo')
      .expand((o, r) => o && { great: r.getObject(o.countObj) });
    await expanded.fetchValue();
    expect(expanded.getValue().great.count).toEqual(12);
    await m.dispatch({
      type: 'PutRef',
      name: 'foo',
      domain: 'd',
      id: second.id,
    });
    await expanded.fetchValue();
    expect(expanded.getValue().great.count).toEqual(42);
  });
});
