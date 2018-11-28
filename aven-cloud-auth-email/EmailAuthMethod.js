import createMessageAuthMethod from '../aven-cloud-auth-message/createMessageAuthMethod';

export default function EmailAuthMethod({ agent }) {
  const authMethodName = 'email';
  function identifyAuthInfo(authInfo) {
    if (!authInfo || !authInfo.email) {
      return null;
    }
    return String(authInfo.email);
  }
  async function sendVerification(authInfo, verifyCode) {
    await agent.actions.SendEmail({
      to: authInfo.email,
      subject: 'welcome',
      message: `Your code is ${verifyCode}`,
    });
  }

  return createMessageAuthMethod({
    authMethodName,
    sendVerification,
    identifyAuthInfo,
  });
}
