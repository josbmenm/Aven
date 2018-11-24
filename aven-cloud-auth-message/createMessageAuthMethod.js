import { checksum, genAuthCode } from "../aven-cloud-utils/Crypto";

export default function createMessageAuthMethod({
  authMethodName,
  sendVerification,
  identifyAuthInfo
}) {
  function canVerify(authInfo, accountId) {
    if (identifyAuthInfo(authInfo) === null) {
      return false;
    }
    return true;
  }

  async function getMethodId(authInfo) {
    return `${authMethodName}-${await checksum(identifyAuthInfo(authInfo))}`;
  }

  async function requestVerification({ authInfo, methodState, accountId }) {
    const verificationKey = await genAuthCode();

    // todo, check recent verification send time and avoid sending again
    await sendVerification(authInfo, verificationKey, accountId);

    return {
      ...methodState,
      verificationKey,
      verificationSendTime: Date.now(),
      verificationChallenge: {
        ...authInfo
      },
      authInfo
    };
  }

  async function performVerification({
    authInfo,
    methodState,
    verificationResponse,
    accountId
  }) {
    if (!methodState || !methodState.verificationKey) {
      throw new Error("Invalid auth verification");
    }
    // todo check expiry time

    if (verificationResponse.key !== methodState.verificationKey) {
      throw new Error("Invalid auth verification");
    }
    return {
      ...methodState,
      verificationSendTime: null,
      lastVerificationTime: Date.now(),
      verificationKey: null
    };
  }

  return {
    name: authMethodName,
    canVerify,
    requestVerification,
    performVerification,
    getMethodId
  };
}
