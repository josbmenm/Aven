import createMemoryStorageSource from '../createMemoryStorageSource';
import createCloudDoc from '../createCloudDoc';
import { BehaviorSubject } from 'rxjs-compat';

function getNull() {
  return null;
}
describe('doc generic behavior', () => {
  test('handles creation', () => {
    const source = createMemoryStorageSource({ domain: 'foo' });
    const doc = createCloudDoc({ source, domain: 'foo', name: 'bar' });
    expect(doc.getName()).toBe('bar');
    expect(doc.domain).toBe('foo');
  });
  test('fails on creation without domain', () => {
    const source = createMemoryStorageSource({ domain: 'test' });
    expect(() =>
      createCloudDoc({
        source,
        name: 'foo',
        parentName: new BehaviorSubject(null),
      })
    ).toThrow();
  });
  test('fails on creation without name', () => {
    const source = createMemoryStorageSource({ domain: 'test' });
    expect(() =>
      createCloudDoc({
        source,
        domain: 'test',
        parentName: new BehaviorSubject(null),
      })
    ).toThrow();
  });

  test('fails on creation for name with slash', () => {
    const source = createMemoryStorageSource({ domain: 'test' });
    expect(() =>
      createCloudDoc({
        source,
        domain: 'test',
        name: 'foo/bar',
        parentName: new BehaviorSubject(null),
      })
    ).toThrow();
  });
});

describe('doc get', () => {
  test('handles get of child', () => {
    const source = createMemoryStorageSource({ domain: 'test' });
    const doc = createCloudDoc({
      source,
      domain: 'test',
      name: 'myDoc',
      parentName: new BehaviorSubject(null),
    });
    const child = doc.get('friend');
    expect(child.getFullName()).toEqual('myDoc/friend');
    expect(child.domain).toEqual('test');
  });
  test('handles get of self', () => {
    const source = createMemoryStorageSource({ domain: 'test' });
    const doc = createCloudDoc({
      source,
      domain: 'test',
      name: 'myDoc',
      parentName: new BehaviorSubject(null),
    });
    const gotDoc = doc.get('');
    expect(gotDoc).toEqual(doc);
  });
});

describe('basic doc source interaction', () => {
  test('fetches docs', async () => {
    const source = createMemoryStorageSource({ domain: 'test' });
    const { id } = await source.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'myDoc',
      value: { foo: 'bar' },
    });
    const doc = createCloudDoc({
      source,
      domain: 'test',
      name: 'myDoc',
      parentName: new BehaviorSubject(null),
    });
    expect(doc.getBlock()).toEqual(undefined);
    await doc.fetch();
    expect(doc.getBlock().id).toEqual(id);
  });

  test('doc can putId of old put id', async () => {
    const source = createMemoryStorageSource({ domain: 'test' });
    const doc = createCloudDoc({
      source,
      domain: 'test',
      name: 'myDoc',
      parentName: new BehaviorSubject(null),
    });
    const { id } = await doc.put({
      foo: 42,
    });
    await doc.put({
      foo: 47,
    });
    await doc.putId(id);
    const docResult = await source.dispatch({
      type: 'GetDoc',
      domain: 'test',
      name: 'myDoc',
    });
    expect(docResult.id).toEqual(id);
    const result = await source.dispatch({
      type: 'GetBlock',
      domain: 'test',
      name: 'myDoc',
      id: docResult.id,
    });
    expect(result.value.foo).toEqual(42);
  });

  test('puts blocks', async () => {
    const source = createMemoryStorageSource({ domain: 'test' });
    const doc = createCloudDoc({
      source,
      domain: 'test',
      name: 'myDoc',
      parentName: new BehaviorSubject(null),
    });
    await doc.put({
      foo: 47,
    });
    const { id } = await source.dispatch({
      type: 'GetDoc',
      domain: 'test',
      name: 'myDoc',
    });
    const result = await source.dispatch({
      type: 'GetBlock',
      domain: 'test',
      name: 'myDoc',
      id,
    });
    expect(result.value.foo).toEqual(47);
  });
});
const waitForSync_TODO_REMOVE_THIS = () =>
  new Promise(res => setTimeout(res, 1));

describe('observing docs', () => {
  test('observe doc works', async () => {
    const source = createMemoryStorageSource({ domain: 'test' });
    const obj1 = await source.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    const obj2 = await source.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: { foo: 'baz' },
    });
    const obj3 = await source.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: { foo: 'qux' },
    });
    await source.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo',
      id: obj1.id,
    });
    const doc = createCloudDoc({
      source,
      domain: 'test',
      name: 'foo',
      parentName: new BehaviorSubject(null),
    });
    let lastObserved = null;
    const subscription = doc.observe.subscribe({
      next: e => {
        lastObserved = e;
      },
    });
    expect(lastObserved.id).toEqual(null);
    await doc.fetch();
    expect(lastObserved.id).toEqual(obj1.id);

    await source.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo',
      id: obj2.id,
    });
    expect(lastObserved.id).toEqual(obj2.id);

    subscription.unsubscribe();
    await source.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo',
      id: obj3.id,
    });
    expect(lastObserved.id).toEqual(obj2.id);
  });

  test('observe value', async () => {
    const source = createMemoryStorageSource({ domain: 'test' });
    const obj1 = await source.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    const obj2 = await source.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: { foo: 'baz' },
    });
    const obj3 = await source.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: { foo: 'qux' },
    });
    await source.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo',
      id: obj1.id,
    });
    const doc = createCloudDoc({
      source,
      domain: 'test',
      name: 'foo',
      parentName: new BehaviorSubject(null),
    });
    let lastObserved = undefined;
    const subscription = doc.observeValue.subscribe({
      next: v => {
        lastObserved = v;
      },
    });

    expect(lastObserved).toEqual(undefined);
    await doc.fetchValue();
    expect(lastObserved.foo).toEqual('bar');

    await source.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo',
      id: obj2.id,
    });
    await waitForSync_TODO_REMOVE_THIS();
    expect(lastObserved.foo).toEqual('baz');

    subscription.unsubscribe();
    await source.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo',
      id: obj3.id,
    });
    await waitForSync_TODO_REMOVE_THIS();

    expect(lastObserved.foo).toEqual('baz');
  });

  test('observe connected value', async () => {
    const source = createMemoryStorageSource({ domain: 'test' });
    const obj1a = await source.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    const obj1 = await source.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: { the: { value: [obj1a.id] } },
    });
    const obj2a = await source.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: { foo: 'baz' },
    });
    const obj2 = await source.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: { the: { value: [obj2a.id] } },
    });
    await source.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo',
      id: obj1.id,
    });
    const doc = createCloudDoc({
      source,
      domain: 'test',
      name: 'foo',
      parentName: new BehaviorSubject(null),
    });
    let lastObserved = undefined;
    doc.observeConnectedValue(['the', 'value', 0]).subscribe({
      next: v => {
        lastObserved = v;
      },
    });
    expect(lastObserved).toEqual(null);
    await doc.fetchConnectedValue(['the', 'value', 0]);
    expect(lastObserved.foo).toEqual('bar');
    await source.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo',
      id: obj2.id,
    });
    await doc.fetchConnectedValue(['the', 'value', 0]); // todo, things should pass without this line!
    expect(lastObserved.foo).toEqual('baz');
  });

  test.skip('observe connected value before creation', async () => {
    const source = createMemoryStorageSource({ domain: 'test' });

    const doc = createCloudDoc({
      source,
      domain: 'test',
      name: 'foo',
      parentName: new BehaviorSubject(null),
    });
    let lastObserved = undefined;
    doc.observeConnectedValue(['the', 'value', 0]).subscribe({
      next: v => {
        lastObserved = v;
      },
    });
    const obj1a = await source.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    const obj1 = await source.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: { the: { value: [obj1a.id] } },
    });
    // const obj2a = await source.dispatch({
    //   type: 'PutDocValue',
    //   domain: 'test',
    //   name: 'foo',
    //   value: { foo: 'baz' },
    // });
    // const obj2 = await source.dispatch({
    //   type: 'PutDocValue',
    //   domain: 'test',
    //   name: 'foo',
    //   value: { the: { value: [obj2a.id] } },
    // });
    await source.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo',
      id: obj1.id,
    });
    expect(lastObserved).toEqual(null);
    await doc.fetchConnectedValue(['the', 'value', 0]);
    expect(lastObserved.foo).toEqual('bar');
    // await source.dispatch({
    //   type: "PutDoc",
    //   domain: "test",
    //   name: "foo",
    //   id: obj2.id
    // });
    // await doc.fetchConnectedValue(["the", "value", 0]); // todo, things should pass without this line!
    // expect(lastObserved.foo).toEqual("baz");
  });
});

async function justASec() {
  return new Promise(resolve => setTimeout(resolve, 1));
}

test('value mapping', async () => {
  const source = createMemoryStorageSource({ domain: 'test' });
  await source.dispatch({
    type: 'PutDocValue',
    domain: 'test',
    name: 'foo',
    value: 2,
  });
  const doc = createCloudDoc({
    source,
    domain: 'test',
    name: 'foo',
    parentName: new BehaviorSubject(null),
    cloudClient: {},
  });
  const mapped = doc.map(o => (typeof o === 'number' ? o * o : null));
  let lastObserved = undefined;
  mapped.observeValue.subscribe({
    next: v => {
      lastObserved = v;
    },
  });
  expect(lastObserved).toEqual(null);
  await mapped.fetchValue();
  expect(lastObserved).toEqual(4);
  await source.dispatch({
    type: 'PutDocValue',
    domain: 'test',
    name: 'foo',
    value: 3,
  });
  await justASec();
  expect(lastObserved).toEqual(9);
});

test('value evaluation', async () => {
  const source = createMemoryStorageSource({ domain: 'test' });
  await source.dispatch({
    type: 'PutDocValue',
    domain: 'test',
    name: 'foo',
    value: 2,
  });
  await source.dispatch({
    type: 'PutDocValue',
    domain: 'test',
    name: 'squared',
    value: {
      type: 'LambdaFunction',
      code: 'a => a * a',
    },
  });
  const squaredDoc = createCloudDoc({
    source,
    domain: 'test',
    name: 'squared',
    parentName: new BehaviorSubject(null),
    cloudClient: {},
  });
  const doc = createCloudDoc({
    source,
    domain: 'test',
    name: 'foo',
    parentName: new BehaviorSubject(null),
    cloudClient: {
      get: name => {
        if (name === 'squared') {
          return squaredDoc;
        }
        throw new Error('not expecting that!');
      },
    },
  });
  const evald = doc.get('^squared');
  let lastObserved = undefined;
  evald.observeValue.subscribe({
    next: v => {
      lastObserved = v;
    },
  });
  expect(lastObserved).toEqual(undefined);
  await evald.fetchValue();
  expect(lastObserved).toEqual(4);
  await source.dispatch({
    type: 'PutDocValue',
    domain: 'test',
    name: 'foo',
    value: 3,
  });
  await justASec();
  expect(lastObserved).toEqual(9);
});
