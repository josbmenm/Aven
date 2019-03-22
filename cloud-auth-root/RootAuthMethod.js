import { compareSecureString } from '../aven-cloud-utils/Crypto';

export default function RootAuthMethod({ rootPasswordHash }) {
  function canVerify(verificationInfo, accountId) {
    if (verificationInfo.type === 'root') {
      return true;
    }
    if (accountId === 'root') {
      return true;
    }
    return false;
  }

  async function getMethodId() {
    return 'auth-root';
  }

  async function requestVerification({ verificationInfo, methodState }) {
    return {
      ...methodState,
      verificationChallenge: {
        message: 'Provide Password', // this isn't really used..
      },
      verificationInfo,
    };
  }

  async function performVerification({
    methodState,
    verificationResponse,
    accountId,
  }) {
    if (accountId !== 'root') {
      throw new Error('Invalid auth verification');
    }
    const { password } = verificationResponse;
    if (!password) {
      throw new Error(
        'no password provided in verificationResponse of performVerification'
      );
    }
    const isValid = await compareSecureString(password, rootPasswordHash);
    if (!isValid) {
      throw new Error('Invalid auth verification');
    }
    return {
      ...methodState,
    };
  }

  return {
    name: 'root',
    canVerify,
    requestVerification,
    performVerification,
    getMethodId,
  };
}
