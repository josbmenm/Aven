import startMemoryDataSource from "../startMemoryDataSource";
import createCloudObject from "../createCloudObject";

describe("object generic behavior", () => {
  test("handles creation with empty value", () => {
    const obj = createCloudObject({ dataSource: {}, domain: "foo", id: "bar" });
    expect(obj.id).toBe("bar");
    expect(obj.domain).toBe("foo");
  });
  test("fails on creation without domain", () => {
    expect(() =>
      createCloudObject({
        dataSource: {},
        value: { foo: 42 }
      })
    ).toThrow();
  });
  test("fails on creation without value or id", () => {
    expect(() =>
      createCloudObject({
        dataSource: {},
        domain: "test"
      })
    ).toThrow();
  });
  test("handles creation with value", () => {
    const obj = createCloudObject({
      dataSource: {},
      domain: "foo",
      value: { foo: 42 }
    });
    expect(obj.id).toBe("e7e71fa8b5db791e2346856ee09cb45f867439e4");
    expect(obj.domain).toBe("foo");
  });
});

describe("basic object DataSource interaction", () => {
  test("fetches objects", async () => {
    const m = startMemoryDataSource({ domain: "test" });
    const { id } = await m.dispatch({
      type: "PutObject",
      domain: "test",
      value: { foo: "bar" }
    });
    const c = createCloudObject({ dataSource: m, domain: "test", id });
    expect(c.getValue()).toEqual(undefined);
    expect(c.getObject().lastFetchTime).toBe(null);
    await c.fetch();
    expect(c.getObject().lastFetchTime).not.toBe(null);
    expect(c.getValue().foo).toEqual("bar");
  });
  test("fetches null objects", async () => {
    const m = startMemoryDataSource({ domain: "test" });
    const { id } = await m.dispatch({
      type: "PutObject",
      domain: "test",
      value: null
    });
    const c = createCloudObject({ dataSource: m, domain: "test", id });
    expect(c.getValue()).toEqual(undefined);
    expect(c.getObject().lastFetchTime).toBe(null);
    await c.fetch();
    expect(c.getValue()).toEqual(null);
    expect(c.getObject().lastFetchTime).not.toBe(null);
  });
  test("puts objects", async () => {
    const m = startMemoryDataSource({ domain: "test" });

    const c = createCloudObject({
      dataSource: m,
      domain: "test",
      value: { foo: 42 }
    });
    expect(c.getObject().lastPutTime).toBe(null);
    await c.put();
    expect(c.getObject().lastPutTime).not.toBe(null);

    const obj = await m.dispatch({
      type: "GetObject",
      domain: "test",
      id: c.id
    });

    expect(obj.object.foo).toEqual(42);
  });
});

describe("observing", () => {
  test("observe obj", async () => {
    const dataSource = startMemoryDataSource({ domain: "test" });
    const obj1 = await dataSource.dispatch({
      type: "PutObject",
      domain: "test",
      value: { foo: "bar" }
    });
    const c = createCloudObject({ dataSource, domain: "test", id: obj1.id });

    let lastObserved = undefined;
    c.observe.subscribe({
      next: e => {
        lastObserved = e;
      }
    });
    expect(lastObserved.value).toEqual(undefined);
    await c.fetch();
    expect(lastObserved.value.foo).toEqual("bar");
  });
  test("observe value", async () => {
    const dataSource = startMemoryDataSource({ domain: "test" });
    const obj1 = await dataSource.dispatch({
      type: "PutObject",
      domain: "test",
      value: { foo: "bar" }
    });
    const c = createCloudObject({ dataSource, domain: "test", id: obj1.id });

    let lastObserved = undefined;
    c.observeValue.subscribe({
      next: e => {
        lastObserved = e;
      }
    });
    expect(lastObserved).toEqual(undefined);
    await c.fetch();
    expect(lastObserved.foo).toEqual("bar");
  });
});
