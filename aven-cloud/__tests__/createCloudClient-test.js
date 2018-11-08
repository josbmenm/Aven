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

describe("client object behavior", () => {
  test("creates objects", () => {
    const m = startMemoryDataSource({ domain: "mydomain" });
    const c = createCloudClient({ dataSource: m, domain: "mydomain" });
    const obj = c.createObject({ foo: "bar" });
    expect(obj.id).toBe("a5e744d0164540d33b1d7ea616c28f2fa97e754a");
  });
});
