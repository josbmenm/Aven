export default function testDataSource(startTestDataSource) {
  test('basic put and get', async () => {
    const ds = await startTestDataSource({ domain: 'test' });
    const putResult = await ds.dispatch({
      type: 'PutObject',
      domain: 'test',
      value: { foo: 'bar' },
    });
    const obj = await ds.dispatch({
      type: 'GetObject',
      domain: 'test',
      id: putResult.id,
    });
    await ds.close();
    expect(obj.value.foo).toEqual('bar');
  });
}
