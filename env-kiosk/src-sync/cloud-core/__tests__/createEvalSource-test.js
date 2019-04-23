import createMemoryStorageSource from '../createMemoryStorageSource';
import createEvalSource from '../createEvalSource';
import defineCloudFunction from '../defineCloudFunction';
import createCloudClient from '../../cloud-core/createCloudClient';

beforeAll(async () => {});

async function justASec(patienceMS) {
  const duration = patienceMS || 100;
  return new Promise(resolve => setTimeout(resolve, duration));
}

describe('interpreted data sources', () => {
  test('basic interpreted value', async () => {
    const storageSource = createMemoryStorageSource({ domain: 'test' });
    const evalSource = createEvalSource({
      source: storageSource,
      domain: 'test',
    });

    await evalSource.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: 2,
    });

    await evalSource.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'squared',
      value: {
        type: 'LambdaFunction',
        code: '({value}) => value * value',
      },
    });

    const result = await evalSource.dispatch({
      type: 'GetDocValue',
      domain: 'test',
      name: 'foo^squared',
    });

    expect(result.value).toBe(4);
  });

  test('twice interpreted value', async () => {
    const storageSource = createMemoryStorageSource({ domain: 'test' });
    const interpretedSource = createEvalSource({
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
        code: `({value}) => {
        return value * value;
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
    const interpretedSource = createEvalSource({
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
        code: '({value}) => value * value',
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
    const interpretedSource = createEvalSource({
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
    const interpretedSource = createEvalSource({
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
    expect(initialId).not.toEqual(docResult.id);
    let blockResult = await interpretedSource.dispatch({
      type: 'GetBlock',
      domain: 'test',
      name: 'foo^squared',
      id: docResult.id,
    });
    expect(blockResult.value).toBe(9);
  });

  test('static reduced value', async () => {
    const storageSource = createMemoryStorageSource({ domain: 'test' });
    const listValue = defineCloudFunction(
      'listValue',
      ({ value }, doc, cloud, useValue) => {
        let state = [];
        if (value === undefined) {
          return state;
        }
        const action = value.value;
        if (value.on && value.on.id) {
          const ancestorName = `${doc.getFullName()}#${value.on.id}^listValue`;
          state = useValue(cloud.get(ancestorName));
        }

        if (action.add) {
          return [...state, action.add];
        }
        if (action.remove) {
          return state.filter(s => s !== action.remove);
        }
        return state;
      }
    );
    const interpretedSource = createEvalSource({
      source: storageSource,
      domain: 'test',
      functions: [listValue],
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

    const result0 = await interpretedSource.dispatch({
      type: 'GetDocValue',
      name: 'mylist^listValue',
      domain: 'test',
    });

    expect(result0.value).toEqual(['a', 'c']);
    await interpretedSource.dispatch({
      type: 'PutTransactionValue',
      domain: 'test',
      name: 'mylist',
      value: { remove: 'a' },
    });
    const result1 = await interpretedSource.dispatch({
      type: 'GetDocValue',
      name: 'mylist^listValue',
      domain: 'test',
    });
    expect(result1.value).toEqual(['c']);
    expect(result1.id).not.toEqual(result0.id);

    await interpretedSource.dispatch({
      type: 'PutTransactionValue',
      domain: 'test',
      name: 'mylist',
      value: { remove: 'a' },
    });
    const result2 = await interpretedSource.dispatch({
      type: 'GetDocValue',
      name: 'mylist^listValue',
      domain: 'test',
    });
    expect(result2.value).toEqual(['c']);
    expect(result2.id).toEqual(result1.id);
  });

  test('interpteted reduced value', async () => {
    const storageSource = createMemoryStorageSource({ domain: 'test' });
    const interpretedSource = createEvalSource({
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
        code: `({value}, doc, cloud, useValue) => {
          let state = [];
          if (value === undefined) {
            return state;
          }
          const action = value.value;
          if (value.on && value.on.id) {
            const ancestorName = \`\${doc.getFullName()}#\${
              value.on.id
            }^listValue\`;
            state = useValue(cloud.get(ancestorName));
          }

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

    const result = await interpretedSource.dispatch({
      type: 'GetDocValue',
      name: 'mylist^listValue',
      domain: 'test',
    });

    expect(result.value).toEqual(['a', 'c']);
  });

  test('basic evalDocs static function value', async () => {
    const storageSource = createMemoryStorageSource({ domain: 'test' });

    const squared = defineCloudFunction('squared', ({ value }) => {
      return value * value;
    });

    const interpretedSource = createEvalSource({
      source: storageSource,
      domain: 'test',
      functions: [squared],
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

describe('remote eval', () => {
  test('reducer remote eval', async () => {
    const source = createMemoryStorageSource({ domain: 'd' });
    const cloudReducer = ({ value, id }, doc, cloud, useValue) => {
      let state = [];
      if (!value) {
        return { state };
      }
      let action = value;
      if (value.on && value.on.id) {
        const ancestorName =
          doc.getFullName() + '#' + value.on.id + '^fooReducer';
        const prevValue = useValue(cloud.get(ancestorName)) || [];
        state = prevValue.state;
        action = value.value;
      }
      if (action.add) {
        return {
          lastActionId: id,
          state: [...state, action.add],
        };
      }
      if (action.remove) {
        return {
          lastActionId: id,
          state: state.filter(v => v !== action.remove),
        };
      }
      return state;
    };
    const evalSource = createEvalSource({
      source,
      domain: 'd',
    });
    const c = createCloudClient({ source: evalSource, domain: 'd' });
    c.izDebugz = true;
    c.get('fooReducer').markRemoteLambda(true);
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
    c.setLambda('fooReducer', cloudReducer);
    const s = c.get('fooActions^fooReducer');
    await s.fetchValue();
    expect(s.getValue().state).toEqual(['a', 'b']);
    await source.dispatch({
      type: 'PutTransactionValue',
      domain: 'd',
      name: 'fooActions',
      value: { remove: 'a' },
    });
    await s.fetchValue();
    expect(s.getValue().state).toEqual(['b']);
  });
  test('reducer remote eval subscription', async () => {
    const source = createMemoryStorageSource({ domain: 'd' });
    const cloudReducer = ({ value, id }, doc, cloud, useValue) => {
      let state = [];
      if (!value) {
        return { state };
      }
      let action = value;
      if (value.on && value.on.id) {
        const ancestorName =
          doc.getFullName() + '#' + value.on.id + '^fooReducer';
        const prevValue = useValue(cloud.get(ancestorName)) || [];
        state = prevValue.state;
        action = value.value;
      }
      if (action.add) {
        return {
          lastActionId: id,
          state: [...state, action.add],
        };
      }
      if (action.remove) {
        return {
          lastActionId: id,
          state: state.filter(v => v !== action.remove),
        };
      }
      return state;
    };
    const evalSource = createEvalSource({
      source,
      domain: 'd',
    });
    const c = createCloudClient({ source: evalSource, domain: 'd' });
    c.izDebugz = true;
    c.get('fooReducer').markRemoteLambda(true);
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
    c.setLambda('fooReducer', cloudReducer);
    const s = c.get('fooActions^fooReducer');
    let lastObserved = null;
    s.observeValue.subscribe({
      next: val => {
        lastObserved = val;
      },
    });
    await justASec();
    expect(lastObserved.state).toEqual(['a', 'b']);
    await source.dispatch({
      type: 'PutTransactionValue',
      domain: 'd',
      name: 'fooActions',
      value: { remove: 'a' },
    });
    await justASec();
    expect(lastObserved.state).toEqual(['b']);
  });
});
