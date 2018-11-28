import { checksum, genAuthCode } from '../aven-cloud-utils/Crypto';

export default function createMessageAuthMethod({
  authMethodName,
  sendVerification,
  identifyAuth,
}) {
  function canVerify(verificationInfo) {
    if (identifyAuth(verificationInfo) === null) {
      return false;
    }
    return true;
  }

  async function getMethodId(verificationInfo) {
    return `${authMethodName}-${await checksum(
      identifyAuth(verificationInfo)
    )}`;
  }

  async function requestVerification({
    verificationInfo,
    methodState,
    accountId,
  }) {
    const verificationKey = await genAuthCode();

    // todo, check recent verification send time and avoid sending again
    await sendVerification(verificationInfo, verificationKey, accountId);

    return {
      ...methodState,
      verificationKey,
      verificationSendTime: Date.now(),
      verificationChallenge: {
        ...verificationInfo,
      },
      verificationInfo,
    };
  }

  async function performVerification({ methodState, verificationResponse }) {
    if (!methodState || !methodState.verificationKey) {
      throw new Error('Invalid auth verification');
    }
    // todo check expiry time

    if (verificationResponse.key !== methodState.verificationKey) {
      throw new Error('Invalid auth verification');
    }
    return {
      ...methodState,
      verificationSendTime: null,
      lastVerificationTime: Date.now(),
      verificationKey: null,
    };
  }

  return {
    name: authMethodName,
    canVerify,
    requestVerification,
    performVerification,
    getMethodId,
  };
}
