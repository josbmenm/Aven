import createMessageAuthMethod from '../aven-cloud-auth-message/createMessageAuthMethod';

export default function EmailAuthMethod({ agent }) {
  const authMethodName = 'email';
  function identifyInfo(verificationInfo) {
    if (!verificationInfo || !verificationInfo.email) {
      return null;
    }
    return String(verificationInfo.email);
  }
  async function sendVerification(verificationInfo, verifyCode) {
    await agent.actions.SendEmail({
      to: verificationInfo.email,
      subject: 'welcome',
      message: `Your code is ${verifyCode}`,
    });
  }

  return createMessageAuthMethod({
    authMethodName,
    sendVerification,
    identifyInfo,
  });
}
