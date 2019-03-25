import createMemoryStorageSource from '../createMemoryStorageSource';
import createEvalDataSource from '../createEvalDataSource';

beforeAll(async () => {});

describe('interpreted data sources', () => {
  test('basic interpreted value', async () => {
    const storageSource = createMemoryStorageSource({ domain: 'test' });
    const interpretedSource = createEvalDataSource({
      source: storageSource,
      domain: 'test',
    });

    await interpretedSource.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: 2,
    });

    await interpretedSource.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'squared',
      value: {
        type: 'LambdaFunction',
        code: 'a => a * a',
      },
    });

    const result = await interpretedSource.dispatch({
      type: 'GetDocValue',
      domain: 'test',
      name: 'foo^squared',
    });

    expect(result.value).toBe(4);
  });

  test('twice interpreted value', async () => {
    const storageSource = createMemoryStorageSource({ domain: 'test' });
    const interpretedSource = createEvalDataSource({
      source: storageSource,
      domain: 'test',
    });

    await interpretedSource.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: 2,
    });

    await interpretedSource.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'squared',
      value: {
        type: 'LambdaFunction',
        code: `(a) => {
        return a * a;
      }`,
      },
    });

    const result = await interpretedSource.dispatch({
      type: 'GetDocValue',
      domain: 'test',
      name: 'foo^squared^squared',
    });

    expect(result.value).toBe(16);
  });

  test('computations for specific blocks', async () => {
    // fix by allowing eval on cloud blocks!
    const storageSource = createMemoryStorageSource({ domain: 'test' });
    const interpretedSource = createEvalDataSource({
      source: storageSource,
      domain: 'test',
    });

    const firstPut = await interpretedSource.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: 2,
    });
    await interpretedSource.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: 3,
    });
    await interpretedSource.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'squared',
      value: {
        type: 'LambdaFunction',
        code: 'a => a * a',
      },
    });
    const result = await interpretedSource.dispatch({
      type: 'GetDocValue',
      domain: 'test',
      name: `foo#${firstPut.id}^squared`,
    });

    expect(result.value).toBe(4);
  });

  test('expanding interpreted value', async () => {
    const storageSource = createMemoryStorageSource({ domain: 'test' });
    const interpretedSource = createEvalDataSource({
      source: storageSource,
      domain: 'test',
    });

    await interpretedSource.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: null,
    });
    await interpretedSource.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo/a',
      value: 3,
    });
    await interpretedSource.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo/b',
      value: 5,
    });

    await interpretedSource.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'getSomething',
      value: {
        type: 'LambdaFunction',
        code: `(a, doc, client, useValue) => {
        // a is the current value of the doc
        const fooA = useValue(doc.get('a'));
        const fooB = useValue(doc.get('b'));
        if (!fooA  || !fooB) {
          return null;
        }
        return fooA * fooB;
      }`,
      },
    });

    const result = await interpretedSource.dispatch({
      type: 'GetDocValue',
      domain: 'test',
      name: 'foo^getSomething',
    });

    expect(result.value).toBe(15);
  });

  test.skip('getdoc works with block fetch', async () => {
    const storageSource = createMemoryStorageSource({ domain: 'test' });
    const interpretedSource = createEvalDataSource({
      source: storageSource,
      domain: 'test',
    });
    await interpretedSource.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: 2,
    });

    await interpretedSource.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'squared',
      value: {
        type: 'LambdaFunction',
        code: 'a => a * a',
      },
    });

    let docResult = await interpretedSource.dispatch({
      type: 'GetDoc',
      domain: 'test',
      name: 'foo^squared',
    });
    const initialId = docResult.id;
    await interpretedSource.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: 3,
    });
    docResult = await interpretedSource.dispatch({
      type: 'GetDoc',
      domain: 'test',
      name: 'foo^squared',
    });
    console.log(docResult);
    expect(initialId).not.toEqual(docResult.id);
    let blockResult = await interpretedSource.dispatch({
      type: 'GetBlock',
      domain: 'test',
      name: 'foo^squared',
      id: docResult.id,
    });
    expect(blockResult.value).toBe(9);
  });

  test.skip('interpteted reduced value', async () => {
    const storageSource = createMemoryStorageSource({ domain: 'test' });
    const interpretedSource = createEvalDataSource({
      source: storageSource,
      domain: 'test',
    });

    await interpretedSource.dispatch({
      type: 'PutTransactionValue',
      domain: 'test',
      name: 'mylist',
      value: { add: 'a' },
    });

    await interpretedSource.dispatch({
      type: 'PutTransactionValue',
      domain: 'test',
      name: 'mylist',
      value: { add: 'b' },
    });

    await interpretedSource.dispatch({
      type: 'PutTransactionValue',
      domain: 'test',
      name: 'mylist',
      value: { add: 'c' },
    });

    await interpretedSource.dispatch({
      type: 'PutTransactionValue',
      domain: 'test',
      name: 'mylist',
      value: { remove: 'b' },
    });

    await interpretedSource.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'listValue',
      value: {
        type: 'LambdaFunction',
        code: `(a, doc, cloud, useValue) => {
          let state = [];
          if (!a) {
            return [];
          }
          if (a.on && a.on.id) {
            const ancestorName = doc.getFullName() + '#' + a.on.id + '^listValue';
            state = useValue(cloud.get(ancestorName)) || [];
          }

          const action = a.value;

          if (action.add) {
            return [...state, action.add];
          }
          if (action.remove) {
            return state.filter(s => s !== action.remove);
          }
          return state;
        }`,
      },
    });

    // const result = await interpretedSource.dispatch({
    //   type: 'GetDocValue',
    //   name: 'mylist^listValue',
    //   domain: 'test',
    // });

    // expect(result.value).toEqual(['a', 'c']);
  });

  test('basic evalDocs static function value', async () => {
    const storageSource = createMemoryStorageSource({ domain: 'test' });
    const interpretedSource = createEvalDataSource({
      source: storageSource,
      domain: 'test',
      evalDocs: {
        squared: a => {
          return a * a;
        },
      },
    });

    await interpretedSource.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: 2,
    });

    let result = await interpretedSource.dispatch({
      type: 'GetDocValue',
      domain: 'test',
      name: 'foo^squared',
    });

    expect(result.value).toBe(4);

    await interpretedSource.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: 3,
    });

    result = await interpretedSource.dispatch({
      type: 'GetDocValue',
      domain: 'test',
      name: 'foo^squared',
    });

    expect(result.value).toBe(9);
  });
});
