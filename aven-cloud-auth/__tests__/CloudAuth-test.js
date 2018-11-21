import startMemoryDataSource from "../../aven-cloud/startMemoryDataSource";
import CloudAuth from "../CloudAuth";
import RootAuthMethod from "../../aven-cloud-auth-root/RootAuthMethod";

import { hashSecureString } from "../../aven-cloud-utils/Crypto";

describe("Cloud auth", () => {
  test("gets root authentication", async () => {
    const dataSource = startMemoryDataSource({ domain: "test" });
    const password = "secret, foo";
    const rootPasswordHash = await hashSecureString(password);
    const rootMethod = RootAuthMethod({
      rootPasswordHash
    });

    const authDataSource = CloudAuth({ dataSource, methods: [rootMethod] });

    const rootSession = await authDataSource.dispatch({
      type: "CreateSession",
      domain: "test",
      authInfo: {
        type: "root"
      },
      accountId: "root",
      verificationResponse: { password }
    });

    expect(typeof rootSession.token).toEqual("string");
    expect(typeof rootSession.sessionId).toEqual("string");
    expect(typeof rootSession.accountId).toEqual("string");

    const v = await authDataSource.dispatch({
      type: "ValidateSession",
      auth: rootSession,
      domain: "test"
    });

    expect(v.accountId).toEqual("root");
  });

  test("no authentication gets empty permissions at root", async () => {
    const dataSource = startMemoryDataSource({ domain: "test" });

    const authDataSource = CloudAuth({ dataSource, methods: [] });

    const noAuthRootPermissions = await authDataSource.dispatch({
      type: "GetPermissions",
      auth: null,
      domain: "test",
      name: null
    });

    expect(noAuthRootPermissions.canRead).toEqual(false);
    expect(noAuthRootPermissions.canWrite).toEqual(false);
    expect(noAuthRootPermissions.canPost).toEqual(false);
  });

  test("root authentication gets full permissions of domain", async () => {
    const dataSource = startMemoryDataSource({ domain: "test" });

    const password = "secret, foo";
    const rootPasswordHash = await hashSecureString(password);
    const rootMethod = RootAuthMethod({
      rootPasswordHash
    });

    const authDataSource = CloudAuth({ dataSource, methods: [rootMethod] });

    const rootSession = await authDataSource.dispatch({
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
      auth: rootSession,
      domain: "test",
      name: null
    });

    expect(rootPermissions.canRead).toEqual(true);
    expect(rootPermissions.canWrite).toEqual(true);
    expect(rootPermissions.canPost).toEqual(true);
  });

  test.only("log out via destroy session", async () => {
    const dataSource = startMemoryDataSource({ domain: "test" });

    const password = "secret, foo";
    const rootPasswordHash = await hashSecureString(password);
    const rootMethod = RootAuthMethod({
      rootPasswordHash
    });

    const authDataSource = CloudAuth({ dataSource, methods: [rootMethod] });

    const rootSession = await authDataSource.dispatch({
      type: "CreateSession",
      domain: "test",
      authInfo: {
        type: "root"
      },
      accountId: "root",
      verificationResponse: { password }
    });

    await authDataSource.dispatch({
      type: "DestroySession",
      auth: rootSession,
      domain: "test"
    });

    const rootPermissionsAfterLogout = await authDataSource.dispatch({
      type: "GetPermissions",
      auth: rootSession,
      domain: "test",
      name: null
    });

    expect(rootPermissionsAfterLogout.canRead).toEqual(false);
    expect(rootPermissionsAfterLogout.canWrite).toEqual(false);
    expect(rootPermissionsAfterLogout.canPost).toEqual(false);
  });

  test("gets anon authentication", async () => {
    const dataSource = startMemoryDataSource({ domain: "test" });

    const authDataSource = CloudAuth({ dataSource, methods: [] });

    const anonSession = await authDataSource.dispatch({
      type: "CreateAnonymousSession",
      domain: "test"
    });

    expect(typeof anonSession.token).toEqual("string");
    expect(typeof anonSession.sessionId).toEqual("string");
    expect(typeof anonSession.accountId).toEqual("string");
  });
});
