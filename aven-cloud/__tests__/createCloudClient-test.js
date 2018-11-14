import startMemoryDataSource from "../startMemoryDataSource";
import createCloudClient from "../createCloudClient";

describe("create client generic behavior", () => {
  test("passes arbitrary actions to dispatch", () => {
    let lastDispatched = null;
    const c = createCloudClient({
      domain: "test",
      dataSource: {
        dispatch: a => {
          lastDispatched = a;
        },
        close: () => {},
        observeRef: () => {}
      }
    });
    c.dispatch({ type: "my action" });
    expect(lastDispatched.type).toEqual("my action");
  });
});

describe("client ref behavior", () => {
  test("gets refs", async () => {
    const m = startMemoryDataSource({ domain: "mydomain" });
    const c = createCloudClient({ dataSource: m, domain: "mydomain" });
    const ref = c.getRef("foo");
    expect(ref.id).toBe(undefined);
    expect(ref.name).toBe("foo");
    await ref.fetch();
    expect(ref.id).toBe(undefined);
  });

  test("deduplicates gotten refs", async () => {
    const m = startMemoryDataSource({ domain: "mydomain" });
    const c = createCloudClient({ dataSource: m, domain: "mydomain" });
    const r0 = c.getRef("foo");
    const r1 = c.getRef("foo");
    expect(r0).toBe(r1);
  });
});
