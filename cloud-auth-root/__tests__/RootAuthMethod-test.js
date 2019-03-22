import { hashSecureString } from '../../aven-cloud-utils/Crypto';
import RootAuthMethod from '../RootAuthMethod';

describe('Auth method behavior', () => {
  test('Auth Verification', async () => {
    const password = 'secret, foo';

    const rootPasswordHash = await hashSecureString(password);

    const method = RootAuthMethod({ rootPasswordHash });

    const verificationInfo = { type: 'root' };

    const verified = await method.performVerification({
      accountId: 'root',
      verificationInfo,
      methodState: undefined,
      verificationResponse: { password },
    });

    expect(verified).not.toBeNull();
  });
});
