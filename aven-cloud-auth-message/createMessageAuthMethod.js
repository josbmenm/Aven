import { checksum } from "../aven-cloud-utils/Crypto";

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

  async function getAuthID(authInfo) {
    return `${authMethodName}-${await checksum(identifyAuthInfo(authInfo))}`;
  }

  async function requestVerification({ authInfo, lastAuthState, accountId }) {
    const verificationKey = await genKey();

    // todo, check recent verification send time and avoid sending again
    await sendVerification(authInfo, verificationKey, accountId);

    return {
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
    lastAuthState,
    verificationResponse,
    accountId
  }) {
    if (verificationResponse.key !== verificationKey) {
      return false;
    }
    // todo check expiry time
    return true;
  }

  return {
    canVerify,
    requestVerification,
    performVerification,
    getAuthID
  };
}
