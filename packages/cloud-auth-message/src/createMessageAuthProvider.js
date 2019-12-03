import { checksum, genAuthCode } from '@aven-cloud/cloud-utils';

export default function createMessageAuthProvider({
  authProviderName,
  sendVerification,
  identifyInfo,
}) {
  function canVerify(verificationInfo) {
    if (identifyInfo(verificationInfo) === null) {
      return false;
    }
    return true;
  }

  async function getProviderId(verificationInfo) {
    return `${authProviderName}-${await checksum(
      identifyInfo(verificationInfo),
    )}`;
  }

  async function requestVerification({
    verificationInfo,
    providerState,
    accountId,
  }) {
    const verificationKey = await genAuthCode();

    // todo, check recent verification send time and avoid sending again
    await sendVerification(verificationInfo, verificationKey, accountId);

    return {
      ...providerState,
      verificationKey,
      verificationSendTime: Date.now(),
      verificationChallenge: {
        ...verificationInfo,
      },
      verificationInfo,
    };
  }

  async function performVerification({ providerState, verificationResponse }) {
    if (!providerState || !providerState.verificationKey) {
      throw new Error('Invalid auth verification');
    }
    // todo check expiry time

    if (verificationResponse.key !== providerState.verificationKey) {
      throw new Error('Invalid auth verification');
    }
    return {
      ...providerState,
      verificationSendTime: null,
      lastVerificationTime: Date.now(),
      verificationKey: null,
    };
  }

  return {
    name: authProviderName,
    canVerify,
    requestVerification,
    performVerification,
    getProviderId,
  };
}
