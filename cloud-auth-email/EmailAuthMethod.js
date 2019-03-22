import createMessageAuthMethod from '../cloud-auth-message/createMessageAuthMethod';

function defaultGetMessage(verifyCode) {
  return {
    message: `Your verification code is ${verifyCode}`,
    subject: 'Welcome!',
  };
}

export default function EmailAuthMethod({ agent, getMessage }) {
  const authMethodName = 'email';
  function identifyInfo(verificationInfo) {
    if (!verificationInfo || !verificationInfo.email) {
      return null;
    }
    return String(verificationInfo.email);
  }
  async function sendVerification(verificationInfo, verifyCode, accountId) {
    const { subject, message } = getMessage
      ? await getMessage(verifyCode, verificationInfo, accountId)
      : await defaultGetMessage(verifyCode, verificationInfo, accountId);

    await agent.actions.SendEmail({
      to: verificationInfo.email,
      subject,
      message,
    });
  }

  return createMessageAuthMethod({
    authMethodName,
    sendVerification,
    identifyInfo,
  });
}
