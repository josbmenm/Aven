import { compareSecureString } from "../aven-cloud-utils/Crypto";

export default function RootAuthMethod({ rootPasswordHash }) {
  function canVerify(authInfo, accountId) {
    if (authInfo.type === "root") {
      return true;
    }
    if (accountId === "root") {
      return true;
    }
    return false;
  }

  async function getAuthID(authInfo) {
    return "auth-root";
  }

  async function requestVerification({ authInfo, lastAuthState, accountId }) {
    return {
      verificationChallenge: {
        message: "Provide Password" // this isn't really used..
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
    if (accountId !== "root") {
      return false;
    }
    const { password } = verificationResponse;
    if (!password) {
      throw new Error(
        "no password provided in authInfo of performVerification"
      );
    }
    const isValid = await compareSecureString(password, rootPasswordHash);
    if (!isValid) {
      return false;
    }
    return true;
  }

  return {
    canVerify,
    requestVerification,
    performVerification,
    getAuthID
  };
}
