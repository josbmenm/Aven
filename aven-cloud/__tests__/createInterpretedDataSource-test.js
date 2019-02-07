import startMemoryDataSource from '../startMemoryDataSource';
import createInterpretedDataSource from '../createInterpretedDataSource';

beforeAll(async () => {});

describe.skip('interpreted data sources', () => {
  test('basic interpreted value', async () => {
    const dataSource = startMemoryDataSource({ domain: 'test' });
    const interpretedSource = createInterpretedDataSource({
      dataSource,
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
    const dataSource = startMemoryDataSource({ domain: 'test' });
    const interpretedSource = createInterpretedDataSource({
      dataSource,
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
    const dataSource = startMemoryDataSource({ domain: 'test' });
    const interpretedSource = createInterpretedDataSource({
      dataSource,
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
    const dataSource = startMemoryDataSource({ domain: 'test' });
    const interpretedSource = createInterpretedDataSource({
      dataSource,
      domain: 'test',
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
        code: `(a, doc) => {
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

  test.skip('getdoc works', async () => {
    const dataSource = startMemoryDataSource({ domain: 'test' });
    const interpretedSource = createInterpretedDataSource({
      dataSource,
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
    const dataSource = startMemoryDataSource({ domain: 'test' });
    const interpretedSource = createInterpretedDataSource({
      dataSource,
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
        code: `(a, doc, cloud, opts) => {
        let state = [];
        console.log('a', a)
        if (a.on.id) {
          const ancestorName = doc.getFullName() + '#' + a.on.id + '^listValue';
          console.log('woah', ancestorName)
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

    console.log('herro');

    const result = await interpretedSource.dispatch({
      type: 'GetDocValue',
      name: 'mylist^listValue',
      domain: 'test',
    });

    // expect(result.value).toEqual(['a', 'c']);
  });
});
