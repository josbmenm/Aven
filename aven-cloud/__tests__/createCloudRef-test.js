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
      name: "foo",
      value: { foo: "bar" }
    });
    await dataSource.dispatch({
      type: "PutRef",
      domain: "test",
      name: "myref",
      id
    });
    const r = createCloudRef({ dataSource, domain: "test", name: "myref" });
    expect(r.getObject()).toEqual(undefined);
    await r.fetch();
    expect(r.getObject().id).toEqual(id);
  });

  test("writes objects", async () => {
    const dataSource = startMemoryDataSource({ domain: "test" });
    const r = createCloudRef({ dataSource, domain: "test", name: "myref" });
    const { id } = await r.write({
      foo: "zoom"
    });
    const result = await dataSource.dispatch({
      type: "GetObject",
      domain: "test",
      name: "myref",
      id
    });
    expect(result.object.foo).toEqual("zoom");
  });

  test("writes ref with putId", async () => {
    const dataSource = startMemoryDataSource({ domain: "test" });
    const r = createCloudRef({ dataSource, domain: "test", name: "myref" });
    const { id } = await r.write({
      foo: 42
    });
    await r.putId(id);
    const refResult = await dataSource.dispatch({
      type: "GetRef",
      domain: "test",
      name: "myref"
    });
    const result = await dataSource.dispatch({
      type: "GetObject",
      domain: "test",
      name: "myref",
      id: refResult.id
    });
    expect(result.object.foo).toEqual(42);
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
      name: "foo",
      value: { foo: "bar" }
    });
    const obj2 = await dataSource.dispatch({
      type: "PutObject",
      domain: "test",
      name: "foo",
      value: { foo: "baz" }
    });
    const obj3 = await dataSource.dispatch({
      type: "PutObject",
      domain: "test",
      name: "foo",
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
      name: "foo",
      value: { foo: "bar" }
    });
    const obj2 = await dataSource.dispatch({
      type: "PutObject",
      domain: "test",
      name: "foo",
      value: { foo: "baz" }
    });
    const obj3 = await dataSource.dispatch({
      type: "PutObject",
      domain: "test",
      name: "foo",
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

  test("observe connected value", async () => {
    const dataSource = startMemoryDataSource({ domain: "test" });
    const obj1a = await dataSource.dispatch({
      type: "PutObject",
      domain: "test",
      name: "foo",
      value: { foo: "bar" }
    });
    const obj1 = await dataSource.dispatch({
      type: "PutObject",
      domain: "test",
      name: "foo",
      value: { the: { value: [obj1a.id] } }
    });
    const obj2a = await dataSource.dispatch({
      type: "PutObject",
      domain: "test",
      name: "foo",
      value: { foo: "baz" }
    });
    const obj2 = await dataSource.dispatch({
      type: "PutObject",
      domain: "test",
      name: "foo",
      value: { the: { value: [obj2a.id] } }
    });
    await dataSource.dispatch({
      type: "PutRef",
      domain: "test",
      name: "foo",
      id: obj1.id
    });
    const r = createCloudRef({ dataSource, domain: "test", name: "foo" });
    let lastObserved = undefined;
    r.observeConnectedValue(["the", "value", 0]).subscribe({
      next: v => {
        lastObserved = v;
      }
    });
    expect(lastObserved).toEqual(undefined);
    await r.fetchConnectedValue(["the", "value", 0]);
    expect(lastObserved.foo).toEqual("bar");
    await dataSource.dispatch({
      type: "PutRef",
      domain: "test",
      name: "foo",
      id: obj2.id
    });
    await r.fetchConnectedValue(["the", "value", 0]); // todo, things should pass without this line!
    expect(lastObserved.foo).toEqual("baz");
  });

  test("observe connected value before creation", async () => {
    const dataSource = startMemoryDataSource({ domain: "test" });

    const r = createCloudRef({ dataSource, domain: "test", name: "foo" });
    let lastObserved = undefined;
    r.observeConnectedValue(["the", "value", 0]).subscribe({
      next: v => {
        lastObserved = v;
      }
    });
    const obj1a = await dataSource.dispatch({
      type: "PutObject",
      domain: "test",
      name: "foo",
      value: { foo: "bar" }
    });
    const obj1 = await dataSource.dispatch({
      type: "PutObject",
      domain: "test",
      name: "foo",
      value: { the: { value: [obj1a.id] } }
    });
    const obj2a = await dataSource.dispatch({
      type: "PutObject",
      domain: "test",
      name: "foo",
      value: { foo: "baz" }
    });
    const obj2 = await dataSource.dispatch({
      type: "PutObject",
      domain: "test",
      name: "foo",
      value: { the: { value: [obj2a.id] } }
    });
    await dataSource.dispatch({
      type: "PutRef",
      domain: "test",
      name: "foo",
      id: obj1.id
    });
    expect(lastObserved).toEqual(undefined);
    await r.fetchConnectedValue(["the", "value", 0]);
    expect(lastObserved.foo).toEqual("bar");
    // await dataSource.dispatch({
    //   type: "PutRef",
    //   domain: "test",
    //   name: "foo",
    //   id: obj2.id
    // });
    // await r.fetchConnectedValue(["the", "value", 0]); // todo, things should pass without this line!
    // expect(lastObserved.foo).toEqual("baz");
  });
});
