import startMemoryDataSource from "../../aven-cloud/startMemoryDataSource";
import CloudAuth from "../CloudAuth";
import RootAuthMethod from "../../aven-cloud-auth-root/RootAuthMethod";

import { hashSecureString } from "../../aven-cloud-utils/Crypto";

describe("Cloud auth Permissions", () => {
  test("permissions are roughly respected", async () => {
    const dataSource = startMemoryDataSource({ domain: "test" });

    const password = "secret, foo";
    const rootPasswordHash = await hashSecureString(password);
    const rootMethod = RootAuthMethod({
      rootPasswordHash
    });

    const authDataSource = CloudAuth({ dataSource, methods: [rootMethod] });

    const { session } = await authDataSource.dispatch({
      type: "CreateSession",
      domain: "test",
      authInfo: {
        type: "root"
      },
      accountId: "root",
      verificationResponse: { password }
    });

    const rootPermissions = await authDataSource.dispatch({
      type: "GetPermissions",
      auth: session,
      domain: "test",
      name: null
    });

    expect(rootPermissions.canRead).toEqual(true);
    expect(rootPermissions.canWrite).toEqual(true);
    expect(rootPermissions.canPost).toEqual(true);

    await expect(
      authDataSource.dispatch({
        type: "PutRef",
        auth: null,
        domain: "test",
        name: "something"
      })
    ).rejects.toThrow();

    await authDataSource.dispatch({
      type: "PutRef",
      auth: session,
      domain: "test",
      name: "something"
    });
  });

  test("put permissions works", async () => {
    const dataSource = startMemoryDataSource({ domain: "test" });

    const password = "secret, foo";
    const rootPasswordHash = await hashSecureString(password);
    const rootMethod = RootAuthMethod({
      rootPasswordHash
    });

    const authDataSource = CloudAuth({ dataSource, methods: [rootMethod] });

    const anonSessionCreated = await authDataSource.dispatch({
      type: "CreateAnonymousSession",
      domain: "test"
    });
    const anonSession = anonSessionCreated.session;
    const rootSessionCreated = await authDataSource.dispatch({
      type: "CreateSession",
      domain: "test",
      authInfo: {
        type: "root"
      },
      accountId: "root",
      verificationResponse: { password }
    });
    const rootSession = rootSessionCreated.session;
    let result = null;

    expect(typeof anonSession.accountId).toEqual("string");
    expect(typeof rootSession.accountId).toEqual("string");
    const fooBar = await authDataSource.dispatch({
      type: "PutObject",
      auth: rootSession,
      domain: "test",
      name: "something",
      value: { foo: "bar" }
    });
    const fooBaz = await authDataSource.dispatch({
      type: "PutObject",
      auth: rootSession,
      domain: "test",
      name: "something",
      value: { foo: "baz" }
    });

    await authDataSource.dispatch({
      type: "PutRef",
      auth: rootSession,
      domain: "test",
      name: "something",
      id: fooBar.id
    });

    await expect(
      authDataSource.dispatch({
        type: "GetRef",
        auth: anonSession,
        domain: "test",
        name: "something"
      })
    ).rejects.toThrow();

    await authDataSource.dispatch({
      type: "PutPermissionRules",
      auth: rootSession,
      domain: "test",
      name: "something",
      defaultRule: {
        canRead: true
      }
      // rules: [
      //   {
      //     accountId: anonSession.accountId,
      //     canWrite: true,
      //     canOwn: true,
      //   }
      // ]
    });

    result = await authDataSource.dispatch({
      type: "GetRef",
      auth: anonSession,
      domain: "test",
      name: "something"
    });
    expect(result.id).toEqual(fooBar.id);

    result = await authDataSource.dispatch({
      type: "GetObject",
      auth: anonSession,
      domain: "test",
      name: "something",
      id: result.id
    });
    expect(result.object.foo).toEqual("bar");
  });
});
