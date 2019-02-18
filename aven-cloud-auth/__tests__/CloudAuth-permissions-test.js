import createMemoryDataSource from '../../aven-cloud/createMemoryDataSource';
import CloudAuth from '../CloudAuth';
import RootAuthMethod from '../../aven-cloud-auth-root/RootAuthMethod';

import { hashSecureString } from '../../aven-cloud-utils/Crypto';

async function establishPermissionsTestData() {
  const dataSource = createMemoryDataSource({ domain: 'test' });

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

  const barBlock = await authDataSource.dispatch({
    type: 'PutDocValue',
    auth: rootSession,
    domain: 'test',
    name: 'something',
    value: { foo: 'baz' },
  });
  const fooBlock = await authDataSource.dispatch({
    type: 'PutDocValue',
    auth: rootSession,
    domain: 'test',
    name: 'something',
    value: { foo: 'bar' },
  });

  return {
    fooBlock,
    barBlock,
    authDataSource,
    rootSession,
    anonSession,
    anonSession2,
  };
}

describe('Cloud auth Permissions', () => {
  test('permissions are roughly respected', async () => {
    const dataSource = createMemoryDataSource({ domain: 'test' });

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
    expect(rootPermissions.canPost).toEqual(true);
    expect(rootPermissions.canWrite).toEqual(true);
    expect(rootPermissions.canAdmin).toEqual(true);

    await expect(
      authDataSource.dispatch({
        type: 'PutDoc',
        auth: null,
        domain: 'test',
        name: 'something',
      })
    ).rejects.toThrow();

    await authDataSource.dispatch({
      type: 'PutDoc',
      auth: session,
      domain: 'test',
      name: 'something',
      id: null,
    });
  });

  test('default read permission', async () => {
    const {
      fooBlock,
      barBlock,
      rootSession,
      anonSession,
      authDataSource,
    } = await establishPermissionsTestData();

    let result = null;

    await expect(
      authDataSource.dispatch({
        type: 'GetDoc',
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
      type: 'GetDoc',
      auth: anonSession,
      domain: 'test',
      name: 'something',
    });
    expect(result.id).toEqual(fooBlock.id);

    result = await authDataSource.dispatch({
      type: 'GetBlock',
      auth: anonSession,
      domain: 'test',
      name: 'something',
      id: result.id,
    });
    expect(result.value.foo).toEqual('bar');
  });

  test('account read permission', async () => {
    const {
      fooBlock,
      barBlock,
      rootSession,
      anonSession,
      authDataSource,
    } = await establishPermissionsTestData();

    let result = null;

    await expect(
      authDataSource.dispatch({
        type: 'GetDoc',
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
      type: 'GetDoc',
      auth: anonSession,
      domain: 'test',
      name: 'something',
    });
    expect(result.id).toEqual(fooBlock.id);

    result = await authDataSource.dispatch({
      type: 'GetBlock',
      auth: anonSession,
      domain: 'test',
      name: 'something',
      id: result.id,
    });
    expect(result.value.foo).toEqual('bar');
    await expect(
      authDataSource.dispatch({
        type: 'GetDoc',
        domain: 'test',
        name: 'something',
      })
    ).rejects.toThrow();
  });

  test('anon session post permission', async () => {
    const {
      rootSession,
      anonSession,
      authDataSource,
    } = await establishPermissionsTestData();

    let result = null;

    await expect(
      authDataSource.dispatch({
        type: 'PostDoc',
        auth: anonSession,
        domain: 'test',
        name: 'something',
        value: { foo: 'bar' },
      })
    ).rejects.toThrow();

    await authDataSource.dispatch({
      type: 'PutPermissionRules',
      auth: rootSession,
      domain: 'test',
      name: 'something',
      defaultRule: {
        canPost: true,
      },
    });

    const postResult = await authDataSource.dispatch({
      type: 'PostDoc',
      auth: anonSession,
      domain: 'test',
      name: 'something',
      value: { foo: 'bar' },
    });
    expect(postResult.name).toMatch(/^something\//);
  });

  test('permissions cascade properly', async () => {
    const {
      rootSession,
      anonSession,
      authDataSource,
    } = await establishPermissionsTestData();
    await authDataSource.dispatch({
      type: 'PutPermissionRules',
      auth: rootSession,
      domain: 'test',
      name: 'great',
      defaultRule: {
        canPost: true,
      },
    });
    await authDataSource.dispatch({
      type: 'PutPermissionRules',
      auth: rootSession,
      domain: 'test',
      name: 'great/news',
      defaultRule: {
        canWrite: true,
      },
    });
    const p1 = await authDataSource.dispatch({
      type: 'GetPermissions',
      auth: anonSession,
      domain: 'test',
      name: 'great',
    });
    expect(p1).toEqual({
      canRead: false,
      canPost: true,
      canWrite: false,
      canAdmin: false,
      owner: null,
    });
    const p2 = await authDataSource.dispatch({
      type: 'GetPermissions',
      auth: anonSession,
      domain: 'test',
      name: 'great/news',
    });
    expect(p2).toEqual({
      canRead: true,
      canPost: true,
      canWrite: true,
      canAdmin: false,
      owner: null,
    });
  });

  test('posted doc ownership', async () => {
    const {
      rootSession,
      anonSession,
      authDataSource,
    } = await establishPermissionsTestData();

    let result = null;

    await authDataSource.dispatch({
      type: 'PutPermissionRules',
      auth: rootSession,
      domain: 'test',
      name: 'something',
      defaultRule: {
        canPost: true,
      },
    });

    const postResult = await authDataSource.dispatch({
      type: 'PostDoc',
      auth: anonSession,
      domain: 'test',
      name: 'something',
      value: { foo: 'bar' },
    });

    const perms = await authDataSource.dispatch({
      type: 'GetPermissions',
      auth: anonSession,
      domain: 'test',
      name: postResult.name,
    });
    expect(perms).toEqual({
      canRead: true,
      canWrite: true,
      canPost: true,
      canAdmin: true,
      owner: anonSession.accountId,
    });
    const childPerms = await authDataSource.dispatch({
      type: 'GetPermissions',
      auth: anonSession,
      domain: 'test',
      name: postResult.name + '/foo',
    });
    expect(childPerms).toEqual({
      canRead: true,
      canWrite: true,
      canPost: true,
      canAdmin: true,
      owner: anonSession.accountId,
    });
  });
  test('account write permission', async () => {
    const {
      fooBlock,
      barBlock,
      rootSession,
      anonSession,
      authDataSource,
    } = await establishPermissionsTestData();

    let result = null;

    await expect(
      authDataSource.dispatch({
        type: 'GetDoc',
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
        type: 'GetDoc',
        domain: 'test',
        name: 'something',
      })
    ).rejects.toThrow();

    await expect(
      authDataSource.dispatch({
        type: 'PutDoc',
        domain: 'test',
        name: 'something',
        id: barBlock.id,
      })
    ).rejects.toThrow();

    await authDataSource.dispatch({
      type: 'PutDoc',
      auth: anonSession,
      domain: 'test',
      name: 'something',
      id: barBlock.id,
    });

    result = await authDataSource.dispatch({
      type: 'GetDoc',
      auth: anonSession,
      domain: 'test',
      name: 'something',
    });
    expect(result.id).toEqual(barBlock.id);
  });

  test('account admin permission for PutPermissionRules', async () => {
    const {
      fooBlock,
      barBlock,
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
        type: 'GetDoc',
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
      type: 'GetDoc',
      auth: anonSession2,
      domain: 'test',
      name: 'something',
    });
    expect(result.id).toEqual(fooBlock.id);
  });

  test('account admin permission for GetPermissionRules', async () => {
    const {
      fooBlock,
      barBlock,
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
      fooBlock,
      barBlock,
      rootSession,
      anonSession,
      anonSession2,
      authDataSource,
    } = await establishPermissionsTestData();

    let result = null;

    await expect(
      authDataSource.dispatch({
        type: 'GetDocValue',
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
      type: 'GetDocValue',
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

  test('root permission allows getting _auth', async () => {
    const {
      fooBlock,
      barBlock,
      rootSession,
      anonSession,
      anonSession2,
      authDataSource,
    } = await establishPermissionsTestData();

    let result = null;

    await expect(
      authDataSource.dispatch({
        type: 'GetDocValue',
        auth: anonSession,
        domain: 'test',
        name: '_auth',
      })
    ).rejects.toThrow();

    result = await authDataSource.dispatch({
      type: 'GetDocValue',
      auth: rootSession,
      domain: 'test',
      name: '_auth',
    });

    expect(result.value).toEqual(undefined);

    await authDataSource.dispatch({
      type: 'PutPermissionRules',
      auth: rootSession,
      domain: 'test',
      name: '',
      defaultRule: {
        canRead: true,
      },
      accountRules: {},
    });

    result = await authDataSource.dispatch({
      type: 'GetDocValue',
      auth: rootSession,
      domain: 'test',
      name: '_auth',
    });

    expect(result.value.defaultRule).toEqual({
      canRead: true,
    });

    await authDataSource.dispatch({
      type: 'PutPermissionRules',
      auth: rootSession,
      domain: 'test',
      //name: null, // null, undefined, and empty string mean the same thing for PutPermissionRules
      defaultRule: {
        canRead: false,
      },
      accountRules: {},
    });

    result = await authDataSource.dispatch({
      type: 'GetDocValue',
      auth: rootSession,
      domain: 'test',
      name: '_auth',
    });

    expect(result.value.defaultRule).toEqual({
      canRead: false,
    });
  });
});
