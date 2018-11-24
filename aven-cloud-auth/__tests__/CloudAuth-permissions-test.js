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
        name: "anything"
      })
    ).rejects.toThrow();

    await authDataSource.dispatch({
      type: "PutRef",
      auth: session,
      domain: "test",
      name: "anything"
    });
  });

  test.skip("put permissions works", async () => {
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

    expect(typeof anonSession.accountId).toEqual("string");
    expect(typeof rootSession.accountId).toEqual("string");

    await authDataSource.dispatch({
      type: "PutRef",
      auth: rootSession,
      domain: "test",
      name: "anything",
      id: null
    });

    await authDataSource.dispatch({
      type: "PutPermissionRules",
      auth: rootSession,
      domain: "test",
      name: "",
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

    await authDataSource.dispatch({
      type: "GetRef",
      domain: "test",
      authInfo: {
        type: "root"
      },
      accountId: "root",
      verificationResponse: { password }
    });

    await authDataSource.dispatch({
      type: "PutPermissionRules",
      auth: rootSession,
      domain: "test",
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
  });
});
