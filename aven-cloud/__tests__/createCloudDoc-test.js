import startMemoryDataSource from '../startMemoryDataSource';
import createCloudDoc from '../createCloudDoc';

function getNull() {
  return null;
}
describe('doc generic behavior', () => {
  test('handles creation', () => {
    const dataSource = startMemoryDataSource({ domain: 'foo' });
    const doc = createCloudDoc({ dataSource, domain: 'foo', name: 'bar' });
    expect(doc.getName()).toBe('bar');
    expect(doc.domain).toBe('foo');
  });
  test('fails on creation without domain', () => {
    const dataSource = startMemoryDataSource({ domain: 'test' });
    expect(() =>
      createCloudDoc({
        dataSource,
        name: 'foo',
      }),
    ).toThrow();
  });
  test('fails on creation without name', () => {
    const dataSource = startMemoryDataSource({ domain: 'test' });
    expect(() =>
      createCloudDoc({
        dataSource,
        domain: 'test',
      }),
    ).toThrow();
  });

  test('fails on creation for name with slash', () => {
    const dataSource = startMemoryDataSource({ domain: 'test' });
    expect(() =>
      createCloudDoc({
        dataSource,
        domain: 'test',
        name: 'foo/bar',
      }),
    ).toThrow();
  });
});

describe('doc get', () => {
  test('handles get of child', () => {
    const dataSource = startMemoryDataSource({ domain: 'test' });
    const doc = createCloudDoc({
      dataSource,
      domain: 'test',
      name: 'myDoc',
      onGetParentName: getNull,
    });
    const child = doc.get('friend');
    expect(child.getFullName()).toEqual('myDoc/friend');
    expect(child.domain).toEqual('test');
  });
  test('handles get of self', () => {
    const dataSource = startMemoryDataSource({ domain: 'test' });
    const doc = createCloudDoc({
      dataSource,
      domain: 'test',
      name: 'myDoc',
      onGetParentName: getNull,
    });
    const gotDoc = doc.get('');
    expect(gotDoc).toEqual(doc);
  });
});

describe('basic doc DataSource interaction', () => {
  test('fetches docs', async () => {
    const dataSource = startMemoryDataSource({ domain: 'test' });
    const { id } = await dataSource.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'myDoc',
      value: { foo: 'bar' },
    });
    const doc = createCloudDoc({
      dataSource,
      domain: 'test',
      name: 'myDoc',
      onGetParentName: getNull,
    });
    expect(doc.getBlock()).toEqual(undefined);
    await doc.fetch();
    expect(doc.getBlock().id).toEqual(id);
  });

  test('doc can putId of old put id', async () => {
    const dataSource = startMemoryDataSource({ domain: 'test' });
    const doc = createCloudDoc({
      dataSource,
      domain: 'test',
      name: 'myDoc',
      onGetParentName: getNull,
    });
    const { id } = await doc.put({
      foo: 42,
    });
    await doc.put({
      foo: 47,
    });
    await doc.putId(id);
    const docResult = await dataSource.dispatch({
      type: 'GetDoc',
      domain: 'test',
      name: 'myDoc',
    });
    expect(docResult.id).toEqual(id);
    const result = await dataSource.dispatch({
      type: 'GetBlock',
      domain: 'test',
      name: 'myDoc',
      id: docResult.id,
    });
    expect(result.value.foo).toEqual(42);
  });

  test('puts blocks', async () => {
    const dataSource = startMemoryDataSource({ domain: 'test' });
    const doc = createCloudDoc({
      dataSource,
      domain: 'test',
      name: 'myDoc',
      onGetParentName: getNull,
    });
    await doc.put({
      foo: 47,
    });
    const { id } = await dataSource.dispatch({
      type: 'GetDoc',
      domain: 'test',
      name: 'myDoc',
    });
    const result = await dataSource.dispatch({
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

// describe('observing docs', () => {
//   test('observe doc works', async () => {
//     const dataSource = startMemoryDataSource({ domain: 'test' });
//     const obj1 = await dataSource.dispatch({
//       type: 'PutDocValue',
//       domain: 'test',
//       name: 'foo',
//       value: { foo: 'bar' },
//     });
//     const obj2 = await dataSource.dispatch({
//       type: 'PutDocValue',
//       domain: 'test',
//       name: 'foo',
//       value: { foo: 'baz' },
//     });
//     const obj3 = await dataSource.dispatch({
//       type: 'PutDocValue',
//       domain: 'test',
//       name: 'foo',
//       value: { foo: 'qux' },
//     });
//     await dataSource.dispatch({
//       type: 'PutDoc',
//       domain: 'test',
//       name: 'foo',
//       id: obj1.id,
//     });
//     const doc = createCloudDoc({
//       dataSource,
//       domain: 'test',
//       name: 'foo',
//       onGetParentName: getNull,
//     });
//     let lastObserved = null;
//     const subscription = doc.observe.subscribe({
//       next: e => {
//         lastObserved = e;
//       },
//     });
//     expect(lastObserved.id).toEqual(null);
//     await doc.fetch();
//     expect(lastObserved.id).toEqual(obj1.id);

//     await dataSource.dispatch({
//       type: 'PutDoc',
//       domain: 'test',
//       name: 'foo',
//       id: obj2.id,
//     });
//     expect(lastObserved.id).toEqual(obj2.id);

//     subscription.unsubscribe();
//     await dataSource.dispatch({
//       type: 'PutDoc',
//       domain: 'test',
//       name: 'foo',
//       id: obj3.id,
//     });
//     expect(lastObserved.id).toEqual(obj2.id);
//   });

//   test('observe value', async () => {
//     const dataSource = startMemoryDataSource({ domain: 'test' });
//     const obj1 = await dataSource.dispatch({
//       type: 'PutDocValue',
//       domain: 'test',
//       name: 'foo',
//       value: { foo: 'bar' },
//     });
//     const obj2 = await dataSource.dispatch({
//       type: 'PutDocValue',
//       domain: 'test',
//       name: 'foo',
//       value: { foo: 'baz' },
//     });
//     const obj3 = await dataSource.dispatch({
//       type: 'PutDocValue',
//       domain: 'test',
//       name: 'foo',
//       value: { foo: 'qux' },
//     });
//     await dataSource.dispatch({
//       type: 'PutDoc',
//       domain: 'test',
//       name: 'foo',
//       id: obj1.id,
//     });
//     const doc = createCloudDoc({
//       dataSource,
//       domain: 'test',
//       name: 'foo',
//       onGetParentName: getNull,
//     });
//     let lastObserved = undefined;
//     const subscription = doc.observeValue.subscribe({
//       next: v => {
//         lastObserved = v;
//       },
//     });

//     expect(lastObserved).toEqual(null);
//     await doc.fetchValue();
//     expect(lastObserved.foo).toEqual('bar');

//     await dataSource.dispatch({
//       type: 'PutDoc',
//       domain: 'test',
//       name: 'foo',
//       id: obj2.id,
//     });
//     await waitForSync_TODO_REMOVE_THIS();
//     expect(lastObserved.foo).toEqual('baz');

//     subscription.unsubscribe();
//     await dataSource.dispatch({
//       type: 'PutDoc',
//       domain: 'test',
//       name: 'foo',
//       id: obj3.id,
//     });
//     await waitForSync_TODO_REMOVE_THIS();

//     expect(lastObserved.foo).toEqual('baz');
//   });

//   test('observe connected value', async () => {
//     const dataSource = startMemoryDataSource({ domain: 'test' });
//     const obj1a = await dataSource.dispatch({
//       type: 'PutDocValue',
//       domain: 'test',
//       name: 'foo',
//       value: { foo: 'bar' },
//     });
//     const obj1 = await dataSource.dispatch({
//       type: 'PutDocValue',
//       domain: 'test',
//       name: 'foo',
//       value: { the: { value: [obj1a.id] } },
//     });
//     const obj2a = await dataSource.dispatch({
//       type: 'PutDocValue',
//       domain: 'test',
//       name: 'foo',
//       value: { foo: 'baz' },
//     });
//     const obj2 = await dataSource.dispatch({
//       type: 'PutDocValue',
//       domain: 'test',
//       name: 'foo',
//       value: { the: { value: [obj2a.id] } },
//     });
//     await dataSource.dispatch({
//       type: 'PutDoc',
//       domain: 'test',
//       name: 'foo',
//       id: obj1.id,
//     });
//     const doc = createCloudDoc({
//       dataSource,
//       domain: 'test',
//       name: 'foo',
//       onGetParentName: getNull,
//     });
//     let lastObserved = undefined;
//     doc.observeConnectedValue(['the', 'value', 0]).subscribe({
//       next: v => {
//         lastObserved = v;
//       },
//     });
//     expect(lastObserved).toEqual(null);
//     await doc.fetchConnectedValue(['the', 'value', 0]);
//     expect(lastObserved.foo).toEqual('bar');
//     await dataSource.dispatch({
//       type: 'PutDoc',
//       domain: 'test',
//       name: 'foo',
//       id: obj2.id,
//     });
//     await doc.fetchConnectedValue(['the', 'value', 0]); // todo, things should pass without this line!
//     expect(lastObserved.foo).toEqual('baz');
//   });

//   test('observe connected value before creation', async () => {
//     const dataSource = startMemoryDataSource({ domain: 'test' });

//     const doc = createCloudDoc({
//       dataSource,
//       domain: 'test',
//       name: 'foo',
//       onGetParentName: getNull,
//     });
//     let lastObserved = undefined;
//     doc.observeConnectedValue(['the', 'value', 0]).subscribe({
//       next: v => {
//         lastObserved = v;
//       },
//     });
//     const obj1a = await dataSource.dispatch({
//       type: 'PutDocValue',
//       domain: 'test',
//       name: 'foo',
//       value: { foo: 'bar' },
//     });
//     const obj1 = await dataSource.dispatch({
//       type: 'PutDocValue',
//       domain: 'test',
//       name: 'foo',
//       value: { the: { value: [obj1a.id] } },
//     });
//     // const obj2a = await dataSource.dispatch({
//     //   type: 'PutDocValue',
//     //   domain: 'test',
//     //   name: 'foo',
//     //   value: { foo: 'baz' },
//     // });
//     // const obj2 = await dataSource.dispatch({
//     //   type: 'PutDocValue',
//     //   domain: 'test',
//     //   name: 'foo',
//     //   value: { the: { value: [obj2a.id] } },
//     // });
//     await dataSource.dispatch({
//       type: 'PutDoc',
//       domain: 'test',
//       name: 'foo',
//       id: obj1.id,
//     });
//     expect(lastObserved).toEqual(null);
//     await doc.fetchConnectedValue(['the', 'value', 0]);
//     expect(lastObserved.foo).toEqual('bar');
//     // await dataSource.dispatch({
//     //   type: "PutDoc",
//     //   domain: "test",
//     //   name: "foo",
//     //   id: obj2.id
//     // });
//     // await doc.fetchConnectedValue(["the", "value", 0]); // todo, things should pass without this line!
//     // expect(lastObserved.foo).toEqual("baz");
//   });
// });
