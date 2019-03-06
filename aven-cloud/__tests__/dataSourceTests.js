export default function testDataSource(startTestDataSource) {
  test('basic put and get', async () => {
    const ds = await startTestDataSource({ domain: 'test' });
    const putResult = await ds.dispatch({
      type: 'PutDocValue',
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

  test('get blocks', async () => {
    const ds = await startTestDataSource({ domain: 'test' });
    const putResult1 = await ds.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      value: { foo: 'bar' },
      name: 'foo',
    });
    const putResult2 = await ds.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      value: { foo: 'foo' },
      name: 'foo',
    });
    const { results } = await ds.dispatch({
      type: 'GetBlocks',
      domain: 'test',
      ids: [putResult1.id, putResult2.id],
      name: 'foo',
    });
    expect(results[0].id).toEqual(putResult1.id);
    expect(results[1].id).toEqual(putResult2.id);
    await ds.close();
  });

  test('gets multiple docs', async () => {
    const ds = await startTestDataSource({ domain: 'test' });
    await ds.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      value: { myName: 'isFoo' },
      name: 'foo',
    });
    await ds.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      value: { myName: 'isBar' },
      name: 'bar',
    });
    const { results } = await ds.dispatch({
      type: 'GetDocValues',
      domain: 'test',
      names: ['foo', 'bar'],
    });
    expect(results[0].value.myName).toEqual('isFoo');
    expect(results[1].value.myName).toEqual('isBar');
    await ds.close();
  });

  test('move doc shows in list', async () => {
    const ds = await startTestDataSource({ domain: 'test' });
    const blk = await ds.dispatch({
      type: 'PutDocValue',
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
    let result;
    result = await ds.dispatch({
      type: 'GetDocValue',
      domain: 'test',
      name: '_children',
    });
    expect(result.value.docs).toEqual(['foo']);
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
    expect(result.value.docs).toEqual(['foobob']);
  });

  test('move doc works', async () => {
    const ds = await startTestDataSource({ domain: 'test' });
    const blk = await ds.dispatch({
      type: 'PutDocValue',
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
    let list = null;
    list = await ds.dispatch({
      type: 'ListDocs',
      domain: 'test',
    });
    expect(list.docs).toEqual([]);

    const blk = await ds.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    list = await ds.dispatch({
      type: 'ListDocs',
      domain: 'test',
    });
    expect(list.docs).toEqual(['foo']);

    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'bar',
      id: blk.id,
    });
    list = await ds.dispatch({
      type: 'ListDocs',
      domain: 'test',
    });
    expect(list.docs).toEqual(['foo', 'bar']);
  });

  // test('list docs length limit', async () => {
  //   const ds = await startTestDataSource({ domain: 'test' });
  //   let docs = null;
  //   docs = await ds.dispatch({
  //     type: 'ListDocs',
  //     domain: 'test',
  //   });
  //   expect(docs).toEqual([]);

  //   setMaxChildListLength(10)

  //   await Promise.all(Array(10).fill(null).map(async () => {
  //     await ds.dispatch({
  //       type: 'PostDocValue',
  //       domain: 'test',
  //       name: 'foo',
  //       value: { foo: 'bar' },
  //     });
  //   }));

  //   await ds.dispatch({
  //     type: 'PostDocValue',
  //     domain: 'test',
  //     name: 'foo',
  //     value: { foo: 'bar' },
  //   });
  //   docs = await ds.dispatch({
  //     type: 'ListDocs',
  //     domain: 'test',
  //   });
  //   expect(docs).toEqual(['foo']);

  //   await ds.dispatch({
  //     type: 'PutDoc',
  //     domain: 'test',
  //     name: 'bar',
  //     id: blk.id,
  //   });
  //   docs = await ds.dispatch({
  //     type: 'ListDocs',
  //     domain: 'test',
  //   });
  //   expect(docs).toEqual(['foo', 'bar']);
  // });

  test('list doc works works with GetValue _children', async () => {
    const ds = await startTestDataSource({ domain: 'test' });
    let docs = null;
    docs = await ds.dispatch({
      type: 'GetDocValue',
      domain: 'test',
      name: '_children',
    });
    expect(docs.value.docs).toEqual([]);

    const blk = await ds.dispatch({
      type: 'PutDocValue',
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
    expect(docs.value.docs).toEqual(['foo']);

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
    expect(docs.value.docs).toEqual(['foo', 'bar']);

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
    expect(docs.value.docs).toEqual(['bar']);
  });

  test('move doc affects children too', async () => {
    const ds = await startTestDataSource({ domain: 'test' });
    const blk = await ds.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
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
    expect(result.value.docs).toEqual(['foo']);
    result = await ds.dispatch({
      type: 'GetDocValue',
      domain: 'test',
      name: 'foo/_children',
    });
    expect(result.value.docs).toEqual(['bar', 'baz']);
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
    expect(result.value.docs).toEqual(['foobob']);
    result = await ds.dispatch({
      type: 'GetDocValue',
      domain: 'test',
      name: 'foobob/_children',
    });
    expect(result.value.docs).toEqual(['bar', 'baz']);
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

  test('gets multiple missing docs', async () => {
    const ds = await startTestDataSource({ domain: 'test' });
    const doc = await ds.dispatch({
      type: 'GetDocs',
      domain: 'test',
      names: ['foo', 'bar'],
    });
    expect(doc.results[0].id).toEqual(undefined);
    expect(doc.results[1].id).toEqual(undefined);
  });

  test('implicit parent list doc ', async () => {
    const ds = await startTestDataSource({ domain: 'test' });
    let result = null;
    result = await ds.dispatch({
      type: 'GetDocValue',
      domain: 'test',
      name: '_children',
    });
    expect(result.value.docs).toEqual([]);

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
    expect(result.value.docs).toEqual(['hello']);
    result = await ds.dispatch({
      type: 'GetDocValue',
      domain: 'test',
      name: 'hello/_children',
    });
    expect(result.value.docs).toEqual(['world', 'mars']);
  });

  test('can destroy parent docs and children go away', async () => {
    const ds = await startTestDataSource({ domain: 'test' });
    const blk = await ds.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
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
    await ds.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
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
    const list = await ds.dispatch({
      type: 'ListDocs',
      domain: 'test',
    });
    expect(list.docs).toEqual([]);
  });

  test('transaction enforcement on PutDocValue', async () => {
    const ds = await startTestDataSource({ domain: 'test' });

    const { id } = await ds.dispatch({
      type: 'PutDocValue',
      name: 'foo',
      domain: 'test',
      value: {
        name: 'init',
      },
    });

    // failed transaction with bad "on" block reference
    await expect(
      ds.dispatch({
        type: 'PutDocValue',
        name: 'foo',
        domain: 'test',
        value: {
          type: 'TransactionValue',
          on: { type: 'BlockReference', id: 'badId' },
          value: {
            name: 'changed',
          },
        },
      })
    ).rejects.toThrow();

    const result = await ds.dispatch({
      type: 'PutDocValue',
      name: 'foo',
      domain: 'test',
      value: {
        type: 'TransactionValue',
        on: { type: 'BlockReference', id },
        value: {
          name: 'changed',
        },
      },
    });

    expect(result.id).not.toBe(null);

    const valueResult = await ds.dispatch({
      type: 'GetDocValue',
      name: 'foo',
      domain: 'test',
    });

    expect(valueResult.value.on.id).toEqual(id);
    expect(valueResult.value.value.name).toEqual('changed');
  });

  test('PutTransactionValue action', async () => {
    // this action behaves like PutDoc, but always forces the type and "on" to be set

    const ds = await startTestDataSource({ domain: 'test' });

    // transact on nonexistent value
    const { id } = await ds.dispatch({
      type: 'PutDocValue',
      name: 'foo',
      domain: 'test',
      value: {
        name: 'init',
      },
    });

    const result = await ds.dispatch({
      type: 'PutTransactionValue',
      name: 'foo',
      domain: 'test',
      value: {
        name: 'changed',
      },
    });

    expect(result.id).not.toBe(null);

    const valueResult = await ds.dispatch({
      type: 'GetDocValue',
      name: 'foo',
      domain: 'test',
    });

    expect(valueResult.value.on.id).toEqual(id);
    expect(valueResult.value.value.name).toEqual('changed');
  });

  describe('parent child docs', () => {
    test('can list with parents', async () => {
      const ds = await startTestDataSource({ domain: 'test' });
      let list = null;
      list = await ds.dispatch({
        type: 'ListDocs',
        domain: 'test',
      });
      expect(list.docs).toEqual([]);

      const blk = await ds.dispatch({
        type: 'PutDocValue',
        domain: 'test',
        name: 'foo',
        value: { foo: 'bar' },
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

      list = await ds.dispatch({
        type: 'ListDocs',
        domain: 'test',
        parentName: 'foo',
      });
      expect(list.docs).toEqual(['bar', 'baz']);

      list = await ds.dispatch({
        type: 'ListDocs',
        domain: 'test',
        parentName: 'foo/bar',
      });
      expect(list.docs).toEqual(['boo']);

      list = await ds.dispatch({
        type: 'ListDocs',
        domain: 'test',
      });
      expect(list.docs).toEqual(['foo']);
    });

    test('list child docs only with GetValue _children', async () => {
      const ds = await startTestDataSource({ domain: 'test' });
      let list = null;

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
      list = await ds.dispatch({
        type: 'GetDocValue',
        domain: 'test',
        name: '_children',
      });
      expect(list.value.docs).toEqual(['foo']);

      list = await ds.dispatch({
        type: 'GetDocValue',
        domain: 'test',
        name: 'foo/_children',
      });
      expect(list.value.docs).toEqual(['bar', 'boo']);

      list = await ds.dispatch({
        type: 'GetDocValue',
        domain: 'test',
        name: 'foo/bar/_children',
      });
      expect(list.value.docs).toEqual(['baz']);
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
    test('puts doc fails when a referenced block is missing', async () => {
      const ds = await startTestDataSource({ domain: 'test' });
      await expect(
        ds.dispatch({
          type: 'PutDoc',
          domain: 'test',
          name: 'foo',
          id: 'wrong',
        })
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

    test('put doc value correctly dereferences blocks', async () => {
      const ds = await startTestDataSource({ domain: 'test' });
      await ds.dispatch({
        type: 'PutDocValue',
        domain: 'test',
        name: 'foo',
        value: {
          foo: 'bar',
          baz: { type: 'BlockReference', value: { woah: 42 } },
        },
      });
      const docResult = await ds.dispatch({
        type: 'GetDocValue',
        domain: 'test',
        name: 'foo',
      });
      expect(docResult.value.foo).toBe('bar');
      expect(docResult.value.baz.type).toBe('BlockReference');
      expect(typeof docResult.value.baz.id).toBe('string');
      expect(docResult.value.baz.value).toBe(undefined);
      const bazBlock = await ds.dispatch({
        type: 'GetBlock',
        domain: 'test',
        name: 'foo',
        id: docResult.value.baz.id,
      });
      expect(bazBlock.value.woah).toEqual(42);
    });

    test('put doc works', async () => {
      const ds = await startTestDataSource({ domain: 'test' });
      const blk = await ds.dispatch({
        type: 'PutDocValue',
        domain: 'test',
        name: 'foo',
        value: { foo: 'bar' },
      });
      await ds.dispatch({
        type: 'PutDocValue',
        domain: 'test',
        name: 'foo',
        value: null,
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
        type: 'PutDocValue',
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
        type: 'PutDocValue',
        domain: 'test',
        name: 'foo',
        value: { foo: 'bar' },
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
      const blk2 = await ds.dispatch({
        type: 'PutDocValue',
        domain: 'test',
        name: 'foo',
        value: { foo: 'baz' },
      });
      await ds.dispatch({
        type: 'PutDocValue',
        domain: 'test',
        name: 'foo',
        value: { foo: 'bar' },
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
        type: 'PutDocValue',
        domain: 'test',
        name: 'foo',
        value: { foo: 'bar' },
      });
      const blk2 = await ds.dispatch({
        type: 'PutDocValue',
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
        type: 'PutDocValue',
        domain: 'test',
        name: 'foo',
        value: { foo: 'bar' },
      });
      const blk2 = await ds.dispatch({
        type: 'PutDocValue',
        domain: 'test',
        name: 'foo',
        value: { foo: 'baz' },
      });
      const blk3 = await ds.dispatch({
        type: 'PutDocValue',
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
      expect(lastObserved.value.docs).toEqual(['foo']);
      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo/bar',
        id: null,
      });
      expect(lastObserved.value.docs).toEqual(['foo']);
      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'baz',
        id: null,
      });
      expect(lastObserved.value.docs).toEqual(['foo', 'baz']);
    });

    // test('observe named doc list works', async () => {
    //   const ds = await startTestDataSource({ domain: 'test' });
    //   await ds.dispatch({
    //     type: 'PutDoc',
    //     domain: 'test',
    //     name: 'foo',
    //     id: null,
    //   });
    //   const obs = await ds.observeDoc('test', 'foo/_children');
    //   let lastObserved = undefined;
    //   obs.subscribe({
    //     next: newVal => {
    //       lastObserved = newVal;
    //     },
    //   });
    //   expect(lastObserved.value.docs).toEqual([]);
    //   await ds.dispatch({
    //     type: 'PutDoc',
    //     domain: 'test',
    //     name: 'foo/bar',
    //     id: null,
    //   });
    //   expect(lastObserved.value.docs).toEqual(['bar']);
    //   await ds.dispatch({
    //     type: 'PutDoc',
    //     domain: 'test',
    //     name: 'foo/baz',
    //     id: null,
    //   });
    //   expect(lastObserved.value.docs).toEqual(['bar', 'baz']);
    //   await ds.dispatch({
    //     type: 'PutDoc',
    //     domain: 'test',
    //     name: 'foo/baz/boo',
    //     id: null,
    //   });
    //   expect(lastObserved.value.docs).toEqual(['bar', 'baz']);
    //   await ds.dispatch({
    //     type: 'DestroyDoc',
    //     domain: 'test',
    //     name: 'foo/baz',
    //     id: null,
    //   });
    //   expect(lastObserved.value.docs).toEqual(['bar']);
    //   await ds.dispatch({
    //     type: 'PutDoc',
    //     domain: 'test',
    //     name: 'foo/baz',
    //     id: null,
    //   });
    //   expect(lastObserved.value.docs).toEqual(['bar', 'baz']);
    // });
  });
}
