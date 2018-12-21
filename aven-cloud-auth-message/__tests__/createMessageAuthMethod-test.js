import startMemoryDataSource from '../../aven-cloud/startMemoryDataSource';
import CloudAuth from '../../aven-cloud-auth/CloudAuth';
import createMessageAuthMethod from '../createMessageAuthMethod';

describe('Auth messaging behavior', () => {
  test('Auth message flow', async () => {
    const dataSource = startMemoryDataSource({
      domain: 'test',
    });

    const authMethodName = 'example-method';

    function identifyInfo(verificationInfo) {
      if (!verificationInfo || !verificationInfo.address) {
        return null;
      }
      return String(verificationInfo.address);
    }

    const sendVerification = jest.fn();

    const method = createMessageAuthMethod({
      authMethodName,
      sendVerification,
      identifyInfo,
    });

    const authDataSource = CloudAuth({ dataSource, methods: [method] });

    await authDataSource.dispatch({
      type: 'CreateSession',
      domain: 'test',
      verificationInfo: {
        address: 'foobar',
      },
      accountId: 'foo',
    });

    expect(sendVerification.mock.calls.length).toBe(1);
    expect(sendVerification.mock.calls[0][0].address).toEqual('foobar');
    expect(sendVerification.mock.calls[0][1].length).toEqual(6);

    const createSessionResp = await authDataSource.dispatch({
      type: 'CreateSession',
      domain: 'test',
      verificationInfo: {
        address: 'foobar',
      },
      verificationResponse: {
        key: sendVerification.mock.calls[0][1],
      },
      accountId: 'foo',
    });

    expect(typeof createSessionResp.session.token).toEqual('string');
    expect(typeof createSessionResp.session.accountId).toEqual('string');
    expect(typeof createSessionResp.session.sessionId).toEqual('string');
  });

  test('anon account can add auth method', async () => {
    const dataSource = startMemoryDataSource({ domain: 'test' });

    const authMethodName = 'example-method';

    function identifyInfo(verificationInfo) {
      if (!verificationInfo || !verificationInfo.address) {
        return null;
      }
      return String(verificationInfo.address);
    }

    const sendVerification = jest.fn();

    const method = createMessageAuthMethod({
      authMethodName,
      sendVerification,
      identifyInfo,
    });

    const authDataSource = CloudAuth({ dataSource, methods: [method] });

    const { session } = await authDataSource.dispatch({
      type: 'CreateAnonymousSession',
      domain: 'test',
    });

    const address = 'great';

    await authDataSource.dispatch({
      type: 'PutAuthMethod',
      domain: 'test',
      auth: session,
      verificationInfo: { address, context: 'heyo!' },
    });
    expect(sendVerification.mock.calls[0][0].address).toEqual(address);
    expect(sendVerification.mock.calls[0][0].context).toEqual('heyo!');
    expect(sendVerification.mock.calls[0][1].length).toEqual(6);

    const authFinalResp = await authDataSource.dispatch({
      type: 'PutAuthMethod',
      domain: 'test',
      auth: session,
      verificationInfo: { address },
      verificationResponse: {
        key: sendVerification.mock.calls[0][1],
      },
    });
    expect(typeof authFinalResp.verifiedMethodId).toEqual('string');
    await authDataSource.dispatch({
      type: 'CreateSession',
      domain: 'test',
      verificationInfo: { address },
    });
    expect(sendVerification.mock.calls[1][1].length).toEqual(6);
    expect(sendVerification.mock.calls[1][1]).not.toEqual(
      sendVerification.mock.calls[0][1],
    );

    const newSessionCreation = await authDataSource.dispatch({
      type: 'CreateSession',
      domain: 'test',
      verificationInfo: { address },
      verificationResponse: {
        key: sendVerification.mock.calls[1][1],
      },
    });
    expect(newSessionCreation.session.accountId).toEqual(session.accountId);
  });
});
