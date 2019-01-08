export default function testDataSource(startTestDataSource) {
  test('basic put and get', async () => {
    const ds = await startTestDataSource({ domain: 'test' });
    const putResult = await ds.dispatch({
      type: 'PutBlock',
      domain: 'test',
      value: { foo: 'bar' },
      name: 'foo',
    });
    const blk = await ds.dispatch({
      type: 'GetBlock',
      domain: 'test',
      id: putResult.id,
      name: 'foo',
    });
    await ds.close();
    expect(blk.value.foo).toEqual('bar');
  });

  // test('move doc shows in list', async () => {
  //   const ds = await startTestDataSource({ domain: 'test' });
  //   const blk = await ds.dispatch({
  //     type: 'PutBlock',
  //     domain: 'test',
  //     name: 'foo',
  //     value: { foo: 'bar' },
  //   });
  //   await ds.dispatch({
  //     type: 'PutDoc',
  //     domain: 'test',
  //     name: 'foo',
  //     id: blk.id,
  //   });
  //   let result;
  //   result = await ds.dispatch({
  //     type: 'GetDocValue',
  //     domain: 'test',
  //     name: '_children',
  //   });
  //   expect(result.value).toEqual(['foo']);
  //   await ds.dispatch({
  //     type: 'MoveDoc',
  //     domain: 'test',
  //     from: 'foo',
  //     to: 'foobob',
  //   });
  //   result = await ds.dispatch({
  //     type: 'GetDocValue',
  //     domain: 'test',
  //     name: '_children',
  //   });
  //   expect(result.value).toEqual(['foobob']);
  // });

  test('move doc works', async () => {
    const ds = await startTestDataSource({ domain: 'test' });
    const blk = await ds.dispatch({
      type: 'PutBlock',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo',
      id: blk.id,
    });
    await ds.dispatch({
      type: 'MoveDoc',
      domain: 'test',
      from: 'foo',
      to: 'foobob',
    });
    const doc = await ds.dispatch({
      type: 'GetDoc',
      domain: 'test',
      name: 'foobob',
    });
    expect(doc.id).toEqual(blk.id);

    const gotBlk = await ds.dispatch({
      type: 'GetBlock',
      domain: 'test',
      name: 'foobob',
      id: doc.id,
    });
    expect(gotBlk.value.foo).toEqual('bar');
  });

  test('list doc works', async () => {
    const ds = await startTestDataSource({ domain: 'test' });
    let docs = null;
    docs = await ds.dispatch({
      type: 'ListDocs',
      domain: 'test',
    });
    expect(docs).toEqual([]);

    const blk = await ds.dispatch({
      type: 'PutBlock',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo',
      id: blk.id,
    });
    docs = await ds.dispatch({
      type: 'ListDocs',
      domain: 'test',
    });
    expect(docs).toEqual(['foo']);

    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'bar',
      id: blk.id,
    });
    docs = await ds.dispatch({
      type: 'ListDocs',
      domain: 'test',
    });
    expect(docs).toEqual(['foo', 'bar']);
  });

  test('list doc works works with GetValue _children', async () => {
    const ds = await startTestDataSource({ domain: 'test' });
    let docs = null;
    docs = await ds.dispatch({
      type: 'GetDocValue',
      domain: 'test',
      name: '_children',
    });
    expect(docs.value).toEqual([]);

    const blk = await ds.dispatch({
      type: 'PutBlock',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo',
      id: null,
    });
    docs = await ds.dispatch({
      type: 'GetDocValue',
      domain: 'test',
      name: '_children',
    });
    expect(docs.value).toEqual(['foo']);

    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'bar',
      id: blk.id,
    });
    docs = await ds.dispatch({
      type: 'GetDocValue',
      domain: 'test',
      name: '_children',
    });
    expect(docs.value).toEqual(['foo', 'bar']);

    await ds.dispatch({
      type: 'DestroyDoc',
      domain: 'test',
      name: 'foo',
    });
    docs = await ds.dispatch({
      type: 'GetDocValue',
      domain: 'test',
      name: '_children',
    });
    expect(docs.value).toEqual(['bar']);
  });

  test('move doc affects children too', async () => {
    const ds = await startTestDataSource({ domain: 'test' });
    const blk = await ds.dispatch({
      type: 'PutBlock',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo',
      id: blk.id,
    });
    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo/bar',
      id: blk.id,
    });
    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo/baz',
      id: blk.id,
    });
    let result;
    result = await ds.dispatch({
      type: 'GetDocValue',
      domain: 'test',
      name: '_children',
    });
    expect(result.value).toEqual(['foo']);
    result = await ds.dispatch({
      type: 'GetDocValue',
      domain: 'test',
      name: 'foo/_children',
    });
    expect(result.value).toEqual(['bar', 'baz']);
    await ds.dispatch({
      type: 'MoveDoc',
      domain: 'test',
      from: 'foo',
      to: 'foobob',
    });

    result = await ds.dispatch({
      type: 'GetDocValue',
      domain: 'test',
      name: '_children',
    });
    expect(result.value).toEqual(['foobob']);
    result = await ds.dispatch({
      type: 'GetDocValue',
      domain: 'test',
      name: 'foobob/_children',
    });
    expect(result.value).toEqual(['bar', 'baz']);
  });

  test('get missing doc', async () => {
    const ds = await startTestDataSource({ domain: 'test' });
    const doc = await ds.dispatch({
      type: 'GetDoc',
      domain: 'test',
      name: 'foo',
    });
    expect(doc.id).toEqual(undefined);
  });

  test('implicit parent list doc ', async () => {
    const ds = await startTestDataSource({ domain: 'test' });
    let result = null;
    result = await ds.dispatch({
      type: 'GetDocValue',
      domain: 'test',
      name: '_children',
    });
    expect(result.value).toEqual([]);

    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'hello/world',
      id: null,
    });
    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'hello/mars',
      id: null,
    });
    result = await ds.dispatch({
      type: 'GetDocValue',
      domain: 'test',
      name: '_children',
    });
    expect(result.value).toEqual(['hello']);
    result = await ds.dispatch({
      type: 'GetDocValue',
      domain: 'test',
      name: 'hello/_children',
    });
    expect(result.value).toEqual(['world', 'mars']);
  });

  test('can destroy parent docs and children go away', async () => {
    const ds = await startTestDataSource({ domain: 'test' });
    const blk = await ds.dispatch({
      type: 'PutBlock',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo',
      id: blk.id,
    });
    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo/bar',
      id: blk.id,
    });
    await ds.dispatch({
      type: 'DestroyDoc',
      domain: 'test',
      name: 'foo',
    });
    const doc = await ds.dispatch({
      type: 'GetDoc',
      domain: 'test',
      name: 'foo/bar',
    });
    expect(doc.id).toEqual(undefined);
  });

  test('destroy doc works', async () => {
    const ds = await startTestDataSource({ domain: 'test' });
    const blk = await ds.dispatch({
      type: 'PutBlock',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo',
      id: blk.id,
    });
    await ds.dispatch({
      type: 'DestroyDoc',
      domain: 'test',
      name: 'foo',
    });
    const doc = await ds.dispatch({
      type: 'GetDoc',
      domain: 'test',
      name: 'foo',
    });
    expect(doc.id).toEqual(undefined);
    const docs = await ds.dispatch({
      type: 'ListDocs',
      domain: 'test',
    });
    expect(docs).toEqual([]);
  });

  describe('parent child docs', () => {
    test('can list with parents', async () => {
      const ds = await startTestDataSource({ domain: 'test' });
      let docs = null;
      docs = await ds.dispatch({
        type: 'ListDocs',
        domain: 'test',
      });
      expect(docs).toEqual([]);

      const blk = await ds.dispatch({
        type: 'PutBlock',
        domain: 'test',
        name: 'foo',
        value: { foo: 'bar' },
      });
      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo',
        id: blk.id,
      });

      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo/bar',
        id: blk.id,
      });

      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo/bar/boo',
        id: blk.id,
      });

      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo/baz',
        id: blk.id,
      });

      docs = await ds.dispatch({
        type: 'ListDocs',
        domain: 'test',
        parentName: 'foo',
      });
      expect(docs).toEqual(['bar', 'baz']);

      docs = await ds.dispatch({
        type: 'ListDocs',
        domain: 'test',
        parentName: 'foo/bar',
      });
      expect(docs).toEqual(['boo']);

      docs = await ds.dispatch({
        type: 'ListDocs',
        domain: 'test',
      });
      expect(docs).toEqual(['foo']);
    });

    test('list child docs only with GetValue _children', async () => {
      const ds = await startTestDataSource({ domain: 'test' });
      let docs = null;

      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo',
        id: null,
      });
      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo/bar',
        id: null,
      });
      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo/boo',
        id: null,
      });
      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo/bar/baz',
        id: null,
      });
      docs = await ds.dispatch({
        type: 'GetDocValue',
        domain: 'test',
        name: '_children',
      });
      expect(docs.value).toEqual(['foo']);

      docs = await ds.dispatch({
        type: 'GetDocValue',
        domain: 'test',
        name: 'foo/_children',
      });
      expect(docs.value).toEqual(['bar', 'boo']);

      docs = await ds.dispatch({
        type: 'GetDocValue',
        domain: 'test',
        name: 'foo/bar/_children',
      });
      expect(docs.value).toEqual(['baz']);
    });
  });

  describe('block storage', () => {
    test('block put fails with invalid domain', async () => {
      const ds = await startTestDataSource({ domain: 'test' });
      await expect(
        ds.dispatch({
          type: 'PutBlock',
          domain: 'test2',
          value: { foo: 'bar' },
          name: 'foo',
        }),
      ).rejects.toThrow();
    });
    test('block put fails with missing doc name', async () => {
      const ds = await startTestDataSource({ domain: 'test' });
      await expect(
        ds.dispatch({
          type: 'PutBlock',
          domain: 'test',
          value: { foo: 'bar' },
        }),
      ).rejects.toThrow();
    });

    test('puts blocks without error', async () => {
      const ds = await startTestDataSource({ domain: 'test' });
      const putResult = await ds.dispatch({
        type: 'PutBlock',
        domain: 'test',
        value: { foo: 'bar' },
        name: 'foo',
      });
      expect(typeof putResult.id).toEqual('string');
    });
    test('puts and gets block', async () => {
      const ds = await startTestDataSource({ domain: 'test' });
      const putResult = await ds.dispatch({
        type: 'PutBlock',
        domain: 'test',
        value: { foo: 'bar' },
        name: 'foo',
      });
      const blk = await ds.dispatch({
        type: 'GetBlock',
        domain: 'test',
        name: 'foo',
        id: putResult.id,
      });
      expect(blk.value.foo).toEqual('bar');
    });
    test('puts and gets null block', async () => {
      const ds = await startTestDataSource({ domain: 'test' });
      const putResult = await ds.dispatch({
        type: 'PutBlock',
        domain: 'test',
        name: 'foo',
        value: null,
      });
      const blk = await ds.dispatch({
        type: 'GetBlock',
        domain: 'test',
        name: 'foo',
        id: putResult.id,
      });
      expect(blk.value).toEqual(null);
    });
  });

  describe('basic data source setup', () => {
    test('gets status reports ready', async () => {
      const ds = await startTestDataSource({ domain: 'test' });
      const status = await ds.dispatch({
        type: 'GetStatus',
      });
      expect(status.ready).toEqual(true);
    });
  });

  describe('doc storage', () => {
    test.skip('puts doc fails when a referenced block is missing', async () => {
      const ds = await startTestDataSource({ domain: 'test' });
      await expect(
        ds.dispatch({
          type: 'PutDoc',
          domain: 'test',
          name: 'foo',
          id: 'wrong',
        }),
      ).rejects.toThrow();
    });

    test('put doc value works', async () => {
      const ds = await startTestDataSource({ domain: 'test' });
      await ds.dispatch({
        type: 'PutDocValue',
        domain: 'test',
        name: 'foo',
        value: { foo: 'bar' },
      });
      const doc = await ds.dispatch({
        type: 'GetDoc',
        domain: 'test',
        name: 'foo',
      });
      const gotBlk = await ds.dispatch({
        type: 'GetBlock',
        domain: 'test',
        name: 'foo',
        id: doc.id,
      });
      expect(gotBlk.value.foo).toEqual('bar');
    });

    test('put doc works', async () => {
      const ds = await startTestDataSource({ domain: 'test' });
      const blk = await ds.dispatch({
        type: 'PutBlock',
        domain: 'test',
        name: 'foo',
        value: { foo: 'bar' },
      });
      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo',
        id: blk.id,
      });
      const doc = await ds.dispatch({
        type: 'GetDoc',
        domain: 'test',
        name: 'foo',
      });
      expect(doc.id).toEqual(blk.id);

      const gotBlock = await ds.dispatch({
        type: 'GetBlock',
        domain: 'test',
        name: 'foo',
        id: doc.id,
      });
      expect(gotBlock.value.foo).toEqual('bar');
    });

    test('post doc works', async () => {
      const ds = await startTestDataSource({ domain: 'test' });
      const blk = await ds.dispatch({
        type: 'PutBlock',
        domain: 'test',
        name: 'foo',
        value: { foo: 'bar' },
      });
      const postResult = await ds.dispatch({
        type: 'PostDoc',
        domain: 'test',
        name: 'foo',
        value: { foo: 'bar' },
      });
      expect(postResult.name).toMatch(/^foo\//);
      expect(postResult.id).toEqual(blk.id);

      const getResult = await ds.dispatch({
        type: 'GetDoc',
        domain: 'test',
        name: postResult.name,
      });
      expect(getResult.id).toEqual(blk.id);
    });

    test('get doc value works', async () => {
      const ds = await startTestDataSource({ domain: 'test' });
      const blk = await ds.dispatch({
        type: 'PutBlock',
        domain: 'test',
        name: 'foo',
        value: { foo: 'bar' },
      });
      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo',
        id: blk.id,
      });
      const doc = await ds.dispatch({
        type: 'GetDocValue',
        domain: 'test',
        name: 'foo',
      });
      expect(doc.value.foo).toEqual('bar');
    });
  });

  describe('observing docs', () => {
    test('observe doc works', async () => {
      const ds = await startTestDataSource({ domain: 'test' });
      // note: we run observeDoc before the doc exists to intentionally test that the subscription works on an empty doc
      const obs = await ds.observeDoc('test', 'foo');
      const blk1 = await ds.dispatch({
        type: 'PutBlock',
        domain: 'test',
        name: 'foo',
        value: { foo: 'bar' },
      });
      const blk2 = await ds.dispatch({
        type: 'PutBlock',
        domain: 'test',
        name: 'foo',
        value: { foo: 'baz' },
      });
      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo',
        id: blk1.id,
      });
      let lastObserved = undefined;
      obs.subscribe({
        next: newVal => {
          lastObserved = newVal;
        },
      });
      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo',
        id: blk2.id,
      });
      expect(lastObserved.id).toEqual(blk2.id);
    });

    test('observe cleanup works', async () => {
      const ds = await startTestDataSource({ domain: 'test' });
      const blk1 = await ds.dispatch({
        type: 'PutBlock',
        domain: 'test',
        name: 'foo',
        value: { foo: 'bar' },
      });
      const blk2 = await ds.dispatch({
        type: 'PutBlock',
        domain: 'test',
        name: 'foo',
        value: { foo: 'baz' },
      });
      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo',
        id: blk1.id,
      });
      const obs = await ds.observeDoc('test', 'foo');
      let lastObserved = undefined;
      const subs = obs.subscribe({
        next: newVal => {
          lastObserved = newVal;
        },
      });
      expect(lastObserved.id).toEqual(blk1.id);
      subs.unsubscribe();
      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo',
        id: blk2.id,
      });
      expect(lastObserved.id).toEqual(blk1.id);
    });

    test('observe same doc multiple times', async () => {
      const ds = await startTestDataSource({ domain: 'test' });
      const blk1 = await ds.dispatch({
        type: 'PutBlock',
        domain: 'test',
        name: 'foo',
        value: { foo: 'bar' },
      });
      const blk2 = await ds.dispatch({
        type: 'PutBlock',
        domain: 'test',
        name: 'foo',
        value: { foo: 'baz' },
      });
      const blk3 = await ds.dispatch({
        type: 'PutBlock',
        domain: 'test',
        name: 'foo',
        value: { foo: 42 },
      });
      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo',
        id: blk1.id,
      });
      const obs1 = await ds.observeDoc('test', 'foo');
      const obs2 = await ds.observeDoc('test', 'foo');
      let lastObserved1 = undefined;
      let lastObserved2 = undefined;
      const subs1 = obs1.subscribe({
        next: newVal => {
          lastObserved1 = newVal;
        },
      });
      const subs2 = obs2.subscribe({
        next: newVal => {
          lastObserved2 = newVal;
        },
      });
      expect(lastObserved1.id).toEqual(blk1.id);
      expect(lastObserved2.id).toEqual(blk1.id);

      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo',
        id: blk2.id,
      });
      expect(lastObserved1.id).toEqual(blk2.id);
      expect(lastObserved2.id).toEqual(blk2.id);

      subs1.unsubscribe();
      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo',
        id: blk3.id,
      });
      expect(lastObserved1.id).toEqual(blk2.id);
      expect(lastObserved2.id).toEqual(blk3.id);
      subs2.unsubscribe();
    });

    test('observe root doc list works', async () => {
      const ds = await startTestDataSource({ domain: 'test' });
      const obs = await ds.observeDoc('test', '_children');
      let lastObserved = undefined;
      obs.subscribe({
        next: newVal => {
          lastObserved = newVal;
        },
      });
      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo',
        id: null,
      });
      expect(lastObserved.value).toEqual(['foo']);
      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo/bar',
        id: null,
      });
      expect(lastObserved.value).toEqual(['foo']);
      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'baz',
        id: null,
      });
      expect(lastObserved.value).toEqual(['foo', 'baz']);
    });

    test('observe named doc list works', async () => {
      const ds = await startTestDataSource({ domain: 'test' });
      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo',
        id: null,
      });
      const obs = await ds.observeDoc('test', 'foo/_children');
      let lastObserved = undefined;
      obs.subscribe({
        next: newVal => {
          lastObserved = newVal;
        },
      });

      expect(lastObserved.value).toEqual([]);
      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo/bar',
        id: null,
      });
      expect(lastObserved.value).toEqual(['bar']);
      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo/baz',
        id: null,
      });
      expect(lastObserved.value).toEqual(['bar', 'baz']);
      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo/baz/boo',
        id: null,
      });
      expect(lastObserved.value).toEqual(['bar', 'baz']);
      await ds.dispatch({
        type: 'DestroyDoc',
        domain: 'test',
        name: 'foo/baz',
        id: null,
      });
      expect(lastObserved.value).toEqual(['bar']);
      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo/baz',
        id: null,
      });
      expect(lastObserved.value).toEqual(['bar', 'baz']);
    });
  });
}
