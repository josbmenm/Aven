import { hashSecureString } from '../../aven-cloud-utils/Crypto';
import RootAuthProvider from '../RootAuthProvider';

describe('Auth provider behavior', () => {
  test('Auth Verification', async () => {
    const password = 'secret, foo';

    const rootPasswordHash = await hashSecureString(password);

    const provider = RootAuthProvider({ rootPasswordHash });

    const verificationInfo = { type: 'root' };

    const verified = await provider.performVerification({
      accountId: 'root',
      verificationInfo,
      providerState: undefined,
      verificationResponse: { password },
    });

    expect(verified).not.toBeNull();
  });
});
