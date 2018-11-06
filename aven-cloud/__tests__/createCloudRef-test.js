import startMemoryDataSource from "../startMemoryDataSource";
import createCloudRef from "../createCloudRef";

describe("ref generic behavior", () => {
  test("handles creation", () => {
    const dataSource = startMemoryDataSource({ domain: "foo" });
    const r = createCloudRef({ dataSource, domain: "foo", name: "bar" });
    expect(r.name).toBe("bar");
    expect(r.domain).toBe("foo");
  });
  test("fails on creation without domain", () => {
    const dataSource = startMemoryDataSource({ domain: "test" });
    expect(() =>
      createCloudRef({
        dataSource,
        name: "foo"
      })
    ).toThrow();
  });
  test("fails on creation without name", () => {
    const dataSource = startMemoryDataSource({ domain: "test" });
    expect(() =>
      createCloudRef({
        dataSource,
        domain: "test"
      })
    ).toThrow();
  });
});

describe("basic ref DataSource interaction", () => {
  test("fetches refs", async () => {
    const dataSource = startMemoryDataSource({ domain: "test" });
    const { id } = await dataSource.dispatch({
      type: "PutObject",
      domain: "test",
      value: { foo: "bar" }
    });
    await dataSource.dispatch({
      type: "PutRef",
      domain: "test",
      name: "myref",
      id
    });
    const r = createCloudRef({ dataSource, domain: "test", name: "myref" });
    expect(r.getObject()).toEqual(null);
    await r.fetch();
    expect(r.getObject().id).toEqual(id);
  });
  test("puts objects", async () => {
    const dataSource = startMemoryDataSource({ domain: "test" });
    const r = createCloudRef({ dataSource, domain: "test", name: "myref" });
    await r.put({
      foo: 47
    });
    const { id } = await dataSource.dispatch({
      type: "GetRef",
      domain: "test",
      name: "myref"
    });
    const result = await dataSource.dispatch({
      type: "GetObject",
      domain: "test",
      name: "myref",
      id
    });
    expect(result.object.foo).toEqual(47);
  });
});

describe("observing refs", () => {
  test("observe ref works", async () => {
    const dataSource = startMemoryDataSource({ domain: "test" });
    const obj1 = await dataSource.dispatch({
      type: "PutObject",
      domain: "test",
      value: { foo: "bar" }
    });
    const obj2 = await dataSource.dispatch({
      type: "PutObject",
      domain: "test",
      value: { foo: "baz" }
    });
    const obj3 = await dataSource.dispatch({
      type: "PutObject",
      domain: "test",
      value: { foo: "qux" }
    });
    await dataSource.dispatch({
      type: "PutRef",
      domain: "test",
      name: "foo",
      id: obj1.id
    });
    const r = createCloudRef({ dataSource, domain: "test", name: "foo" });
    let lastObserved = null;
    const subscription = r.observe.subscribe({
      next: e => {
        lastObserved = e;
      }
    });
    expect(lastObserved.id).toEqual(null);
    await r.fetch();
    expect(lastObserved.id).toEqual(obj1.id);

    await dataSource.dispatch({
      type: "PutRef",
      domain: "test",
      name: "foo",
      id: obj2.id
    });
    expect(lastObserved.id).toEqual(obj2.id);

    subscription.unsubscribe();
    await dataSource.dispatch({
      type: "PutRef",
      domain: "test",
      name: "foo",
      id: obj3.id
    });
    expect(lastObserved.id).toEqual(obj2.id);
  });

  test("observe value", async () => {
    const dataSource = startMemoryDataSource({ domain: "test" });
    const obj1 = await dataSource.dispatch({
      type: "PutObject",
      domain: "test",
      value: { foo: "bar" }
    });
    const obj2 = await dataSource.dispatch({
      type: "PutObject",
      domain: "test",
      value: { foo: "baz" }
    });
    const obj3 = await dataSource.dispatch({
      type: "PutObject",
      domain: "test",
      value: { foo: "qux" }
    });
    await dataSource.dispatch({
      type: "PutRef",
      domain: "test",
      name: "foo",
      id: obj1.id
    });
    const r = createCloudRef({ dataSource, domain: "test", name: "foo" });
    let lastObserved = undefined;
    const subscription = r.observeValue.subscribe({
      next: v => {
        lastObserved = v;
      }
    });

    expect(lastObserved).toEqual(undefined);
    await r.fetchValue();
    expect(lastObserved.foo).toEqual("bar");

    await dataSource.dispatch({
      type: "PutRef",
      domain: "test",
      name: "foo",
      id: obj2.id
    });
    expect(lastObserved.foo).toEqual("baz");

    subscription.unsubscribe();
    await dataSource.dispatch({
      type: "PutRef",
      domain: "test",
      name: "foo",
      id: obj3.id
    });
    expect(lastObserved.foo).toEqual("baz");
  });
});
