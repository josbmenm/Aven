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

  // test('move doc shows in list', async () => {
  //   const ds = await startTestDataSource({ domain: 'test' });
  //   const obj = await ds.dispatch({
  //     type: 'PutBlock',
  //     domain: 'test',
  //     name: 'foo',
  //     value: { foo: 'bar' },
  //   });
  //   await ds.dispatch({
  //     type: 'PutDoc',
  //     domain: 'test',
  //     name: 'foo',
  //     id: obj.id,
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
    const obj = await ds.dispatch({
      type: 'PutBlock',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo',
      id: obj.id,
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
    expect(doc.id).toEqual(obj.id);

    const gotObj = await ds.dispatch({
      type: 'GetBlock',
      domain: 'test',
      name: 'foobob',
      id: doc.id,
    });
    expect(gotObj.value.foo).toEqual('bar');
  });

  test('list doc works', async () => {
    const ds = await startTestDataSource({ domain: 'test' });
    let docs = null;
    docs = await ds.dispatch({
      type: 'ListDocs',
      domain: 'test',
    });
    expect(docs).toEqual([]);

    const obj = await ds.dispatch({
      type: 'PutBlock',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo',
      id: obj.id,
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
      id: obj.id,
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

    const obj = await ds.dispatch({
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
      id: obj.id,
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
    const obj = await ds.dispatch({
      type: 'PutBlock',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo',
      id: obj.id,
    });
    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo/bar',
      id: obj.id,
    });
    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo/baz',
      id: obj.id,
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
    const obj = await ds.dispatch({
      type: 'PutBlock',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo',
      id: obj.id,
    });
    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo/bar',
      id: obj.id,
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
    const obj = await ds.dispatch({
      type: 'PutBlock',
      domain: 'test',
      name: 'foo',
      value: { foo: 'bar' },
    });
    await ds.dispatch({
      type: 'PutDoc',
      domain: 'test',
      name: 'foo',
      id: obj.id,
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

      const obj = await ds.dispatch({
        type: 'PutBlock',
        domain: 'test',
        name: 'foo',
        value: { foo: 'bar' },
      });
      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo',
        id: obj.id,
      });

      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo/bar',
        id: obj.id,
      });

      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo/bar/boo',
        id: obj.id,
      });

      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo/baz',
        id: obj.id,
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

    test('puts objects without error', async () => {
      const ds = await startTestDataSource({ domain: 'test' });
      const putResult = await ds.dispatch({
        type: 'PutBlock',
        domain: 'test',
        value: { foo: 'bar' },
        name: 'foo',
      });
      expect(typeof putResult.id).toEqual('string');
    });
    test('puts and gets object', async () => {
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
        name: 'foo',
        id: putResult.id,
      });
      expect(obj.value.foo).toEqual('bar');
    });
    test('puts and gets null object', async () => {
      const ds = await startTestDataSource({ domain: 'test' });
      const putResult = await ds.dispatch({
        type: 'PutBlock',
        domain: 'test',
        name: 'foo',
        value: null,
      });
      const obj = await ds.dispatch({
        type: 'GetBlock',
        domain: 'test',
        name: 'foo',
        id: putResult.id,
      });
      expect(obj.value).toEqual(null);
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
    test('puts doc fails when a referenced block is missing', async () => {
      const ds = await startTestDataSource({ domain: 'test' });
      await expect(
        ds.dispatch({ type: 'PutDoc', domain: 'test', objectId: 'foo' }),
      ).rejects.toThrow();
    });
  });

  describe('doc storage', () => {
    test('puts doc fails when an object is missing', async () => {
      const ds = await startTestDataSource({ domain: 'test' });
      await expect(
        ds.dispatch({ type: 'PutDoc', domain: 'test', objectId: 'foo' }),
      ).rejects.toThrow();
    });
    test('put doc works', async () => {
      const ds = await startTestDataSource({ domain: 'test' });
      const obj = await ds.dispatch({
        type: 'PutBlock',
        domain: 'test',
        name: 'foo',
        value: { foo: 'bar' },
      });
      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo',
        id: obj.id,
      });
      const doc = await ds.dispatch({
        type: 'GetDoc',
        domain: 'test',
        name: 'foo',
      });
      expect(doc.id).toEqual(obj.id);

      const gotObj = await ds.dispatch({
        type: 'GetBlock',
        domain: 'test',
        name: 'foo',
        id: doc.id,
      });
      expect(gotObj.value.foo).toEqual('bar');
    });

    test('post doc works', async () => {
      const ds = await startTestDataSource({ domain: 'test' });
      const obj = await ds.dispatch({
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
      expect(postResult.id).toEqual(obj.id);

      const getResult = await ds.dispatch({
        type: 'GetDoc',
        domain: 'test',
        name: postResult.name,
      });
      expect(getResult.id).toEqual(obj.id);
    });

    test('get doc value works', async () => {
      const ds = await startTestDataSource({ domain: 'test' });
      const obj = await ds.dispatch({
        type: 'PutBlock',
        domain: 'test',
        name: 'foo',
        value: { foo: 'bar' },
      });
      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo',
        id: obj.id,
      });
      const doc = await ds.dispatch({
        type: 'GetDocValue',
        domain: 'test',
        name: 'foo',
      });
      expect(doc.value.foo).toEqual('bar');
    });

    // test('list object works', async () => {
    //   const ds = await startTestDataSource({ domain: 'test' });
    //   let objs = null;
    //   objs = await ds.dispatch({
    //     type: 'GetDocValue',
    //     domain: 'test',
    //     name: '_blocks',
    //   });
    //   expect(objs.value).toEqual([]);

    //   const obj = await ds.dispatch({
    //     type: 'PutBlock',
    //     domain: 'test',
    //     name: 'foo',
    //     value: { foo: 'bar' },
    //   });

    //   objs = await ds.dispatch({
    //     type: 'GetDocValue',
    //     domain: 'test',
    //     name: '_blocks',
    //   });
    //   expect(objs.value).toEqual([obj.id]);
    // });

    // test('list object of doc works', async () => {
    //   const ds = await startTestDataSource({ domain: 'test' });
    //   let objs = null;
    //   objs = await ds.dispatch({
    //     type: 'GetDocValue',
    //     domain: 'test',
    //     name: 'foo/_blocks',
    //   });
    //   expect(objs.value).toEqual([]);

    //   await ds.dispatch({
    //     type: 'PutBlock',
    //     domain: 'test',
    //     name: 'bar',
    //     value: { foo: 'bar' },
    //   });
    //   const o1 = await ds.dispatch({
    //     type: 'PutBlock',
    //     domain: 'test',
    //     name: 'foo',
    //     value: { foo: 'foo' },
    //   });
    //   const o2 = await ds.dispatch({
    //     type: 'PutBlock',
    //     domain: 'test',
    //     name: 'foo',
    //     value: { foo: 'two' },
    //   });

    //   objs = await ds.dispatch({
    //     type: 'GetDocValue',
    //     domain: 'test',
    //     name: 'foo/_blocks',
    //   });
    //   expect(objs.value).toEqual([o1.id, o2.id]);
    // });

    // test('list object of doc cascades correctly', async () => {
    //   const ds = await startTestDataSource({ domain: 'test' });
    //   let objs = null;
    //   objs = await ds.dispatch({
    //     type: 'GetDocValue',
    //     domain: 'test',
    //     name: 'foo/_blocks',
    //   });
    //   expect(objs.value).toEqual([]);

    //   await ds.dispatch({
    //     type: 'PutBlock',
    //     domain: 'test',
    //     name: 'bar',
    //     value: { foo: 'bar' },
    //   });
    //   const o1 = await ds.dispatch({
    //     type: 'PutBlock',
    //     domain: 'test',
    //     name: 'foo',
    //     value: { foo: 'foo' },
    //   });
    //   const o2 = await ds.dispatch({
    //     type: 'PutBlock',
    //     domain: 'test',
    //     name: 'foo/bar',
    //     value: { foo: 'two' },
    //   });

    //   objs = await ds.dispatch({
    //     type: 'GetDocValue',
    //     domain: 'test',
    //     name: 'foo/_blocks',
    //   });
    //   expect(objs.value).toEqual([o1.id, o2.id]);
    // });
  });

  describe('observing docs', () => {
    test('observe doc works', async () => {
      const ds = await startTestDataSource({ domain: 'test' });
      // note: we run observeDoc before the doc exists to intentionally test that the subscription works on an empty doc
      const obs = await ds.observeDoc('test', 'foo');
      const obj1 = await ds.dispatch({
        type: 'PutBlock',
        domain: 'test',
        name: 'foo',
        value: { foo: 'bar' },
      });
      const obj2 = await ds.dispatch({
        type: 'PutBlock',
        domain: 'test',
        name: 'foo',
        value: { foo: 'baz' },
      });
      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo',
        id: obj1.id,
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
        id: obj2.id,
      });
      expect(lastObserved.id).toEqual(obj2.id);
    });

    test('observe cleanup works', async () => {
      const ds = await startTestDataSource({ domain: 'test' });
      const obj1 = await ds.dispatch({
        type: 'PutBlock',
        domain: 'test',
        name: 'foo',
        value: { foo: 'bar' },
      });
      const obj2 = await ds.dispatch({
        type: 'PutBlock',
        domain: 'test',
        name: 'foo',
        value: { foo: 'baz' },
      });
      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo',
        id: obj1.id,
      });
      const obs = await ds.observeDoc('test', 'foo');
      let lastObserved = undefined;
      const subs = obs.subscribe({
        next: newVal => {
          lastObserved = newVal;
        },
      });
      expect(lastObserved.id).toEqual(obj1.id);
      subs.unsubscribe();
      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo',
        id: obj2.id,
      });
      expect(lastObserved.id).toEqual(obj1.id);
    });

    test('observe same doc multiple times', async () => {
      const ds = await startTestDataSource({ domain: 'test' });
      const obj1 = await ds.dispatch({
        type: 'PutBlock',
        domain: 'test',
        name: 'foo',
        value: { foo: 'bar' },
      });
      const obj2 = await ds.dispatch({
        type: 'PutBlock',
        domain: 'test',
        name: 'foo',
        value: { foo: 'baz' },
      });
      const obj3 = await ds.dispatch({
        type: 'PutBlock',
        domain: 'test',
        name: 'foo',
        value: { foo: 42 },
      });
      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo',
        id: obj1.id,
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
      expect(lastObserved1.id).toEqual(obj1.id);
      expect(lastObserved2.id).toEqual(obj1.id);

      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo',
        id: obj2.id,
      });
      expect(lastObserved1.id).toEqual(obj2.id);
      expect(lastObserved2.id).toEqual(obj2.id);

      subs1.unsubscribe();
      await ds.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'foo',
        id: obj3.id,
      });
      expect(lastObserved1.id).toEqual(obj2.id);
      expect(lastObserved2.id).toEqual(obj3.id);
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
