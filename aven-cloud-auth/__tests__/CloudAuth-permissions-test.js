import startMemoryDataSource from '../../aven-cloud/startMemoryDataSource';
import CloudAuth from '../CloudAuth';
import RootAuthMethod from '../../aven-cloud-auth-root/RootAuthMethod';

import { hashSecureString } from '../../aven-cloud-utils/Crypto';

async function establishPermissionsTestData() {
  const dataSource = startMemoryDataSource({ domain: 'test' });

  const password = 'secret, foo';
  const rootPasswordHash = await hashSecureString(password);
  const rootMethod = RootAuthMethod({
    rootPasswordHash,
  });

  const authDataSource = CloudAuth({ dataSource, methods: [rootMethod] });

  const anonSessionCreated = await authDataSource.dispatch({
    type: 'CreateAnonymousSession',
    domain: 'test',
  });
  const anonSession = anonSessionCreated.session;
  const anonSession2Created = await authDataSource.dispatch({
    type: 'CreateAnonymousSession',
    domain: 'test',
  });
  const anonSession2 = anonSession2Created.session;
  const rootSessionCreated = await authDataSource.dispatch({
    type: 'CreateSession',
    domain: 'test',
    verificationInfo: {
      type: 'root',
    },
    accountId: 'root',
    verificationResponse: { password },
  });
  const rootSession = rootSessionCreated.session;

  const fooObj = await authDataSource.dispatch({
    type: 'PutObject',
    auth: rootSession,
    domain: 'test',
    name: 'something',
    value: { foo: 'bar' },
  });
  const barObj = await authDataSource.dispatch({
    type: 'PutObject',
    auth: rootSession,
    domain: 'test',
    name: 'something',
    value: { foo: 'baz' },
  });

  await authDataSource.dispatch({
    type: 'PutRef',
    auth: rootSession,
    domain: 'test',
    name: 'something',
    id: fooObj.id,
  });
  return {
    fooObj,
    barObj,
    authDataSource,
    rootSession,
    anonSession,
    anonSession2,
  };
}

describe('Cloud auth Permissions', () => {
  test('permissions are roughly respected', async () => {
    const dataSource = startMemoryDataSource({ domain: 'test' });

    const password = 'secret, foo';
    const rootPasswordHash = await hashSecureString(password);
    const rootMethod = RootAuthMethod({
      rootPasswordHash,
    });

    const authDataSource = CloudAuth({ dataSource, methods: [rootMethod] });

    const { session } = await authDataSource.dispatch({
      type: 'CreateSession',
      domain: 'test',
      verificationInfo: {
        type: 'root',
      },
      accountId: 'root',
      verificationResponse: { password },
    });

    const rootPermissions = await authDataSource.dispatch({
      type: 'GetPermissions',
      auth: session,
      domain: 'test',
      name: null,
    });

    expect(rootPermissions.canRead).toEqual(true);
    expect(rootPermissions.canWrite).toEqual(true);
    expect(rootPermissions.canPost).toEqual(true);

    await expect(
      authDataSource.dispatch({
        type: 'PutRef',
        auth: null,
        domain: 'test',
        name: 'something',
      })
    ).rejects.toThrow();

    await authDataSource.dispatch({
      type: 'PutRef',
      auth: session,
      domain: 'test',
      name: 'something',
    });
  });

  test('default read permission', async () => {
    const {
      fooObj,
      barObj,
      rootSession,
      anonSession,
      authDataSource,
    } = await establishPermissionsTestData();

    let result = null;

    await expect(
      authDataSource.dispatch({
        type: 'GetRef',
        auth: anonSession,
        domain: 'test',
        name: 'something',
      })
    ).rejects.toThrow();

    await authDataSource.dispatch({
      type: 'PutPermissionRules',
      auth: rootSession,
      domain: 'test',
      name: 'something',
      defaultRule: {
        canRead: true,
      },
    });

    result = await authDataSource.dispatch({
      type: 'GetRef',
      auth: anonSession,
      domain: 'test',
      name: 'something',
    });
    expect(result.id).toEqual(fooObj.id);

    result = await authDataSource.dispatch({
      type: 'GetObject',
      auth: anonSession,
      domain: 'test',
      name: 'something',
      id: result.id,
    });
    expect(result.value.foo).toEqual('bar');
  });

  test('account read permission', async () => {
    const {
      fooObj,
      barObj,
      rootSession,
      anonSession,
      authDataSource,
    } = await establishPermissionsTestData();

    let result = null;

    await expect(
      authDataSource.dispatch({
        type: 'GetRef',
        auth: anonSession,
        domain: 'test',
        name: 'something',
      })
    ).rejects.toThrow();

    await authDataSource.dispatch({
      type: 'PutPermissionRules',
      auth: rootSession,
      domain: 'test',
      name: 'something',
      defaultRule: {},
      accountRules: {
        [anonSession.accountId]: {
          canRead: true,
        },
      },
    });

    result = await authDataSource.dispatch({
      type: 'GetRef',
      auth: anonSession,
      domain: 'test',
      name: 'something',
    });
    expect(result.id).toEqual(fooObj.id);

    result = await authDataSource.dispatch({
      type: 'GetObject',
      auth: anonSession,
      domain: 'test',
      name: 'something',
      id: result.id,
    });
    expect(result.value.foo).toEqual('bar');
    await expect(
      authDataSource.dispatch({
        type: 'GetRef',
        domain: 'test',
        name: 'something',
      })
    ).rejects.toThrow();
  });

  test('account write permission', async () => {
    const {
      fooObj,
      barObj,
      rootSession,
      anonSession,
      authDataSource,
    } = await establishPermissionsTestData();

    let result = null;

    await expect(
      authDataSource.dispatch({
        type: 'GetRef',
        auth: anonSession,
        domain: 'test',
        name: 'something',
      })
    ).rejects.toThrow();

    await authDataSource.dispatch({
      type: 'PutPermissionRules',
      auth: rootSession,
      domain: 'test',
      name: 'something',
      defaultRule: {},
      accountRules: {
        [anonSession.accountId]: {
          canWrite: true,
        },
      },
    });

    await expect(
      authDataSource.dispatch({
        type: 'GetRef',
        domain: 'test',
        name: 'something',
      })
    ).rejects.toThrow();

    await expect(
      authDataSource.dispatch({
        type: 'PutRef',
        domain: 'test',
        name: 'something',
        id: barObj.id,
      })
    ).rejects.toThrow();

    await authDataSource.dispatch({
      type: 'PutRef',
      auth: anonSession,
      domain: 'test',
      name: 'something',
      id: barObj.id,
    });

    result = await authDataSource.dispatch({
      type: 'GetRef',
      auth: anonSession,
      domain: 'test',
      name: 'something',
    });
    expect(result.id).toEqual(barObj.id);
  });

  test('account admin permission for PutPermissionRules', async () => {
    const {
      fooObj,
      barObj,
      rootSession,
      anonSession,
      anonSession2,
      authDataSource,
    } = await establishPermissionsTestData();

    let result = null;

    await expect(
      authDataSource.dispatch({
        type: 'PutPermissionRules',
        auth: anonSession,
        domain: 'test',
        name: 'something',
        defaultRule: {},
        accountRules: {},
      })
    ).rejects.toThrow();

    await authDataSource.dispatch({
      type: 'PutPermissionRules',
      auth: rootSession,
      domain: 'test',
      name: 'something',
      defaultRule: {},
      accountRules: {
        [anonSession.accountId]: {
          canAdmin: true,
        },
      },
    });

    await expect(
      authDataSource.dispatch({
        type: 'GetRef',
        auth: anonSession2,
        domain: 'test',
        name: 'something',
      })
    ).rejects.toThrow();

    await authDataSource.dispatch({
      type: 'PutPermissionRules',
      auth: anonSession,
      domain: 'test',
      name: 'something',
      defaultRule: {},
      accountRules: {
        [anonSession.accountId]: {
          canAdmin: true,
        },
        [anonSession2.accountId]: {
          canRead: true,
        },
      },
    });

    result = await authDataSource.dispatch({
      type: 'GetRef',
      auth: anonSession2,
      domain: 'test',
      name: 'something',
    });
    expect(result.id).toEqual(fooObj.id);
  });

  test('account admin permission for GetPermissionRules', async () => {
    const {
      fooObj,
      barObj,
      rootSession,
      anonSession,
      anonSession2,
      authDataSource,
    } = await establishPermissionsTestData();

    let result = null;

    await expect(
      authDataSource.dispatch({
        type: 'GetPermissionRules',
        auth: anonSession,
        domain: 'test',
        name: 'something',
      })
    ).rejects.toThrow();

    await authDataSource.dispatch({
      type: 'PutPermissionRules',
      auth: rootSession,
      domain: 'test',
      name: 'something',
      defaultRule: {
        canRead: true,
      },
      accountRules: {
        [anonSession.accountId]: {
          canAdmin: true,
        },
      },
    });

    result = await authDataSource.dispatch({
      type: 'GetPermissionRules',
      auth: anonSession,
      domain: 'test',
      name: 'something',
    });

    expect(result.defaultRule.canRead).toEqual(true);
  });

  test('account admin permission for getting _auth', async () => {
    const {
      fooObj,
      barObj,
      rootSession,
      anonSession,
      anonSession2,
      authDataSource,
    } = await establishPermissionsTestData();

    let result = null;

    await expect(
      authDataSource.dispatch({
        type: 'GetRefValue',
        auth: anonSession,
        domain: 'test',
        name: 'something/_auth',
      })
    ).rejects.toThrow();

    await authDataSource.dispatch({
      type: 'PutPermissionRules',
      auth: rootSession,
      domain: 'test',
      name: 'something',
      defaultRule: {
        canRead: true,
      },
      accountRules: {
        [anonSession.accountId]: {
          canAdmin: true,
        },
      },
    });

    result = await authDataSource.dispatch({
      type: 'GetRefValue',
      auth: anonSession,
      domain: 'test',
      name: 'something/_auth',
    });

    expect(result.value.defaultRule).toEqual({
      canRead: true,
    });
    expect(result.value.accountRules).toEqual({
      [anonSession.accountId]: {
        canAdmin: true,
      },
    });
  });
});
