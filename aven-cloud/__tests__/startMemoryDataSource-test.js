import startMemoryDataSource from "../startMemoryDataSource";

describe("basic data source setup", () => {
  test("throws when starting without a domain", () => {
    expect(() => {
      startMemoryDataSource({});
    }).toThrow();
  });
  test("gets status reports ready", async () => {
    const ds = startMemoryDataSource({ domain: "test" });
    const status = await ds.dispatch({
      type: "GetStatus"
    });
    expect(status.ready);
  });
});

describe("object storage", () => {
  test("object put fails with invalid domain", async () => {
    const ds = startMemoryDataSource({ domain: "test" });
    await expect(
      ds.dispatch({
        type: "PutObject",
        domain: "test2",
        value: { foo: "bar" },
        name: "foo"
      })
    ).rejects.toThrow();
  });
  test("object put fails with missing ref", async () => {
    const ds = startMemoryDataSource({ domain: "test" });
    await expect(
      ds.dispatch({
        type: "PutObject",
        domain: "test",
        value: { foo: "bar" }
      })
    ).rejects.toThrow();
  });

  test("puts objects without error", async () => {
    const ds = startMemoryDataSource({ domain: "test" });
    const putResult = await ds.dispatch({
      type: "PutObject",
      domain: "test",
      value: { foo: "bar" },
      name: "foo"
    });
    expect(typeof putResult.id).toEqual("string");
  });
  test("puts and gets object", async () => {
    const ds = startMemoryDataSource({ domain: "test" });
    const putResult = await ds.dispatch({
      type: "PutObject",
      domain: "test",
      value: { foo: "bar" },
      name: "foo"
    });
    const obj = await ds.dispatch({
      type: "GetObject",
      domain: "test",
      name: "foo",
      id: putResult.id
    });
    expect(obj.object.foo).toEqual("bar");
  });
  test("puts and gets null object", async () => {
    const ds = startMemoryDataSource({ domain: "test" });
    const putResult = await ds.dispatch({
      type: "PutObject",
      domain: "test",
      name: "foo",
      value: null
    });
    const obj = await ds.dispatch({
      type: "GetObject",
      domain: "test",
      name: "foo",
      id: putResult.id
    });
    expect(obj.object).toEqual(null);
  });
});

describe("ref storage", () => {
  test("puts ref fails when an object is missing", async () => {
    const ds = startMemoryDataSource({ domain: "test" });
    await expect(
      ds.dispatch({ type: "PutRef", domain: "test", objectId: "foo" })
    ).rejects.toThrow();
  });
  test("puts ref works", async () => {
    const ds = startMemoryDataSource({ domain: "test" });
    const obj = await ds.dispatch({
      type: "PutObject",
      domain: "test",
      name: "foo",
      value: { foo: "bar" }
    });
    await ds.dispatch({
      type: "PutRef",
      domain: "test",
      name: "foo",
      id: obj.id
    });
    const ref = await ds.dispatch({
      type: "GetRef",
      domain: "test",
      name: "foo"
    });
    expect(ref.id).toEqual(obj.id);
  });
  test("get missing ref", async () => {
    const ds = startMemoryDataSource({ domain: "test" });
    const ref = await ds.dispatch({
      type: "GetRef",
      domain: "test",
      name: "foo"
    });
    expect(ref.id).toEqual(null);
    expect(ref.owner).toEqual(null);
  });
  test("destroy ref works", async () => {
    const ds = startMemoryDataSource({ domain: "test" });
    const obj = await ds.dispatch({
      type: "PutObject",
      domain: "test",
      name: "foo",
      value: { foo: "bar" }
    });
    await ds.dispatch({
      type: "PutRef",
      domain: "test",
      name: "foo",
      id: obj.id
    });
    await ds.dispatch({
      type: "DestroyRef",
      domain: "test",
      name: "foo"
    });
    const ref = await ds.dispatch({
      type: "GetRef",
      domain: "test",
      name: "foo"
    });
    expect(ref.id).toEqual(null);
    expect(ref.owner).toEqual(null);
    const refs = await ds.dispatch({
      type: "ListRefs",
      domain: "test"
    });
    expect(refs).toEqual([]);
  });
  test("list ref works", async () => {
    const ds = startMemoryDataSource({ domain: "test" });
    let refs = null;
    refs = await ds.dispatch({
      type: "ListRefs",
      domain: "test"
    });
    expect(refs).toEqual([]);

    const obj = await ds.dispatch({
      type: "PutObject",
      domain: "test",
      name: "foo",
      value: { foo: "bar" }
    });
    await ds.dispatch({
      type: "PutRef",
      domain: "test",
      name: "foo",
      id: obj.id
    });
    refs = await ds.dispatch({
      type: "ListRefs",
      domain: "test"
    });
    expect(refs).toEqual(["foo"]);

    await ds.dispatch({
      type: "PutRef",
      domain: "test",
      name: "bar",
      id: obj.id
    });
    refs = await ds.dispatch({
      type: "ListRefs",
      domain: "test"
    });
    expect(refs).toEqual(["foo", "bar"]);
  });
});

describe("parent child refs", () => {
  test("can list with parents", async () => {
    const ds = startMemoryDataSource({ domain: "test" });
    let refs = null;
    refs = await ds.dispatch({
      type: "ListRefs",
      domain: "test"
    });
    expect(refs).toEqual([]);

    const obj = await ds.dispatch({
      type: "PutObject",
      domain: "test",
      name: "foo",
      value: { foo: "bar" }
    });
    await ds.dispatch({
      type: "PutRef",
      domain: "test",
      name: "foo",
      id: obj.id
    });

    await ds.dispatch({
      type: "PutRef",
      domain: "test",
      name: "foo/bar",
      id: obj.id
    });

    await ds.dispatch({
      type: "PutRef",
      domain: "test",
      name: "foo/bar/boo",
      id: obj.id
    });

    await ds.dispatch({
      type: "PutRef",
      domain: "test",
      name: "foo/baz",
      id: obj.id
    });

    refs = await ds.dispatch({
      type: "ListRefs",
      domain: "test",
      parentName: "foo"
    });
    expect(refs).toEqual(["bar", "baz"]);

    refs = await ds.dispatch({
      type: "ListRefs",
      domain: "test",
      parentName: "foo/bar"
    });
    expect(refs).toEqual(["boo"]);

    refs = await ds.dispatch({
      type: "ListRefs",
      domain: "test"
    });
    expect(refs).toEqual(["foo"]);
  });
  test("can destroy parent refs and children go away", async () => {
    const ds = startMemoryDataSource({ domain: "test" });
    const obj = await ds.dispatch({
      type: "PutObject",
      domain: "test",
      name: "foo",
      value: { foo: "bar" }
    });
    await ds.dispatch({
      type: "PutRef",
      domain: "test",
      name: "foo",
      id: obj.id
    });
    await ds.dispatch({
      type: "PutRef",
      domain: "test",
      name: "foo/bar",
      id: obj.id
    });
    await ds.dispatch({
      type: "DestroyRef",
      domain: "test",
      name: "foo"
    });
    const ref = await ds.dispatch({
      type: "GetRef",
      domain: "test",
      name: "foo/bar"
    });
    expect(ref.id).toEqual(null);
    expect(ref.owner).toEqual(null);
  });
});

describe("observing refs", () => {
  test("puts ref fails when an object is missing", async () => {
    const ds = startMemoryDataSource({ domain: "test" });
    await expect(
      ds.dispatch({ type: "PutRef", domain: "test", objectId: "foo" })
    ).rejects.toThrow();
  });
  test("observe ref works", async () => {
    const ds = startMemoryDataSource({ domain: "test" });
    const obj1 = await ds.dispatch({
      type: "PutObject",
      domain: "test",
      name: "foo",
      value: { foo: "bar" }
    });
    const obj2 = await ds.dispatch({
      type: "PutObject",
      domain: "test",
      name: "foo",
      value: { foo: "baz" }
    });
    await ds.dispatch({
      type: "PutRef",
      domain: "test",
      name: "foo",
      id: obj1.id
    });
    const obs = await ds.observeRef("test", "foo");
    let lastObserved = undefined;
    obs.subscribe({
      next: newVal => {
        lastObserved = newVal;
      }
    });
    await ds.dispatch({
      type: "PutRef",
      domain: "test",
      name: "foo",
      id: obj2.id
    });
    expect(lastObserved.id).toEqual(obj2.id);
  });
  test("observe cleanup works", async () => {
    const ds = startMemoryDataSource({ domain: "test" });
    const obj1 = await ds.dispatch({
      type: "PutObject",
      domain: "test",
      name: "foo",
      value: { foo: "bar" }
    });
    const obj2 = await ds.dispatch({
      type: "PutObject",
      domain: "test",
      name: "foo",
      value: { foo: "baz" }
    });
    await ds.dispatch({
      type: "PutRef",
      domain: "test",
      name: "foo",
      id: obj1.id
    });
    const obs = await ds.observeRef("test", "foo");
    let lastObserved = undefined;
    const subs = obs.subscribe({
      next: newVal => {
        lastObserved = newVal;
      }
    });
    expect(lastObserved.id).toEqual(obj1.id);
    subs.unsubscribe();
    await ds.dispatch({
      type: "PutRef",
      domain: "test",
      name: "foo",
      id: obj2.id
    });
    expect(lastObserved.id).toEqual(obj1.id);
  });

  test("observe same ref multiple times", async () => {
    const ds = startMemoryDataSource({ domain: "test" });
    const obj1 = await ds.dispatch({
      type: "PutObject",
      domain: "test",
      name: "foo",
      value: { foo: "bar" }
    });
    const obj2 = await ds.dispatch({
      type: "PutObject",
      domain: "test",
      name: "foo",
      value: { foo: "baz" }
    });
    const obj3 = await ds.dispatch({
      type: "PutObject",
      domain: "test",
      name: "foo",
      value: { foo: 42 }
    });
    await ds.dispatch({
      type: "PutRef",
      domain: "test",
      name: "foo",
      id: obj1.id
    });
    const obs1 = await ds.observeRef("test", "foo");
    const obs2 = await ds.observeRef("test", "foo");
    let lastObserved1 = undefined;
    let lastObserved2 = undefined;
    const subs1 = obs1.subscribe({
      next: newVal => {
        lastObserved1 = newVal;
      }
    });
    const subs2 = obs2.subscribe({
      next: newVal => {
        lastObserved2 = newVal;
      }
    });
    expect(lastObserved1.id).toEqual(obj1.id);
    expect(lastObserved2.id).toEqual(obj1.id);

    await ds.dispatch({
      type: "PutRef",
      domain: "test",
      name: "foo",
      id: obj2.id
    });
    expect(lastObserved1.id).toEqual(obj2.id);
    expect(lastObserved2.id).toEqual(obj2.id);

    subs1.unsubscribe();
    await ds.dispatch({
      type: "PutRef",
      domain: "test",
      name: "foo",
      id: obj3.id
    });
    expect(lastObserved1.id).toEqual(obj2.id);
    expect(lastObserved2.id).toEqual(obj3.id);
  });
});
