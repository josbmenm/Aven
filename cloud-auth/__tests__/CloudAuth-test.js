import createMemoryStorageSource from '../../cloud-core/createMemoryStorageSource';
import CloudAuth from '../CloudAuth';
import RootAuthProvider from '../../cloud-auth-root/RootAuthProvider';

import { hashSecureString } from '../../cloud-utils/Crypto';

describe('Cloud auth sessions', () => {
  test('gets root authentication', async () => {
    const dataSource = createMemoryStorageSource({ domain: 'test' });
    const password = 'secret, foo';
    const rootPasswordHash = await hashSecureString(password);
    const rootProvider = RootAuthProvider({
      rootPasswordHash,
    });

    const authDataSource = CloudAuth({ dataSource, providers: [rootProvider] });

    const { session } = await authDataSource.dispatch({
      type: 'CreateSession',
      domain: 'test',
      verificationInfo: {
        type: 'root',
      },
      accountId: 'root',
      verificationResponse: { password },
    });

    expect(typeof session.token).toEqual('string');
    expect(typeof session.sessionId).toEqual('string');
    expect(typeof session.accountId).toEqual('string');

    const v = await authDataSource.dispatch({
      type: 'VerifySession',
      auth: session,
      domain: 'test',
    });

    expect(v.accountId).toEqual('root');
  });

  test('no authentication gets empty permissions at root', async () => {
    const dataSource = createMemoryStorageSource({ domain: 'test' });

    const authDataSource = CloudAuth({ dataSource, providers: [] });

    const noAuthRootPermissions = await authDataSource.dispatch({
      type: 'GetPermissions',
      auth: null,
      domain: 'test',
      name: null,
    });

    expect(noAuthRootPermissions.canRead).toEqual(false);
    expect(noAuthRootPermissions.canPost).toEqual(false);
    expect(noAuthRootPermissions.canWrite).toEqual(false);
    expect(noAuthRootPermissions.canAdmin).toEqual(false);
  });

  test('root authentication gets full permissions of domain', async () => {
    const dataSource = createMemoryStorageSource({ domain: 'test' });

    const password = 'secret, foo';
    const rootPasswordHash = await hashSecureString(password);
    const rootProvider = RootAuthProvider({
      rootPasswordHash,
    });

    const authDataSource = CloudAuth({ dataSource, providers: [rootProvider] });

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
  });

  test('log out via destroy session', async () => {
    const dataSource = createMemoryStorageSource({ domain: 'test' });

    const password = 'secret, foo';
    const rootPasswordHash = await hashSecureString(password);
    const rootProvider = RootAuthProvider({
      rootPasswordHash,
    });

    const authDataSource = CloudAuth({ dataSource, providers: [rootProvider] });

    const { session } = await authDataSource.dispatch({
      type: 'CreateSession',
      domain: 'test',
      verificationInfo: {
        type: 'root',
      },
      accountId: 'root',
      verificationResponse: { password },
    });

    await authDataSource.dispatch({
      type: 'DestroySession',
      auth: session,
      domain: 'test',
    });

    await expect(
      authDataSource.dispatch({
        type: 'GetPermissions',
        auth: session,
        domain: 'test',
        name: null,
      })
    ).rejects.toThrow();
  });

  test('gets anon authentication', async () => {
    const dataSource = createMemoryStorageSource({ domain: 'test' });

    const authDataSource = CloudAuth({ dataSource, providers: [] });

    const { session } = await authDataSource.dispatch({
      type: 'CreateAnonymousSession',
      domain: 'test',
    });

    expect(typeof session.token).toEqual('string');
    expect(typeof session.sessionId).toEqual('string');
    expect(typeof session.accountId).toEqual('string');
  });
});
