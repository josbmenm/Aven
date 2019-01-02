export default function testDataSource(startTestDataSource) {
  test('basic put and get', async () => {
    const ds = await startTestDataSource({ domain: 'test' });
    const putResult = await ds.dispatch({
      type: 'PutBlock',
      domain: 'test',
      value: { foo: 'bar' },
      name: 'foo',
    });
    const obj = await ds.dispatch({
      type: 'GetBlock',
      domain: 'test',
      id: putResult.id,
      name: 'foo',
    });
    await ds.close();
    expect(obj.value.foo).toEqual('bar');
  });
}
