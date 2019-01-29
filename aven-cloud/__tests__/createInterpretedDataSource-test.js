import startMemoryDataSource from '../startMemoryDataSource';
import createInterpretedDataSource from '../createInterpretedDataSource';

beforeAll(async () => {});

test.skip('basic interpreted value', async () => {
  const ds = startMemoryDataSource({ domain: 'test' });
  const interpretedSource = createInterpretedDataSource(ds);

  await interpretedSource.dispatch({
    type: 'PutDocValue',
    name: 'foo',
    value: 2,
  });

  await interpretedSource.dispatch({
    type: 'PutDocValue',
    name: 'squared',
    value: {
      type: 'LambdaFunction',
      code: 'a => a * a',
    },
  });

  const result = await interpretedSource.dispatch({
    type: 'GetDocValue',
    name: 'foo/_by/squared',
    domain: 'test',
  });

  expect(result.value).toBe(4);
});

test.skip('twice interpreted value', async () => {
  const ds = startMemoryDataSource({ domain: 'test' });
  const interpretedSource = createInterpretedDataSource(ds);

  await interpretedSource.dispatch({
    type: 'PutDocValue',
    name: 'foo',
    value: 2,
  });

  await interpretedSource.dispatch({
    type: 'PutDocValue',
    name: 'squared',
    value: {
      type: 'LambdaFunction',
      code: 'a => a * a',
    },
  });

  const result = await interpretedSource.dispatch({
    type: 'GetDocValue',
    name: 'foo/_by/squared/_by/squared',
    domain: 'test',
  });

  expect(result.value).toBe(16);
});

test.skip('expanding interpreted value', async () => {
  const ds = startMemoryDataSource({ domain: 'test' });
  const interpretedSource = createInterpretedDataSource(ds);

  await interpretedSource.dispatch({
    type: 'PutDocValue',
    name: 'foo/a',
    value: 3,
  });
  await interpretedSource.dispatch({
    type: 'PutDocValue',
    name: 'foo/b',
    value: 5,
  });

  await interpretedSource.dispatch({
    type: 'PutDocValue',
    name: 'getSomething',
    value: {
      type: 'LambdaFunction',
      code: `(a, doc) => {
        // a is the current value of the doc
        const fooA = useObservable(doc.get('a').observeValue);
        const fooB = useObservable(doc.get('b').observeValue);
        return fooA * fooB;
      }`,
    },
  });

  const result = await interpretedSource.dispatch({
    type: 'GetDocValue',
    name: 'foo/_by/getSomething',
    domain: 'test',
  });

  expect(result.value).toBe(15);
});
