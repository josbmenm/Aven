import createMessageAuthMethod from '../aven-cloud-auth-message/createMessageAuthMethod';

function defaultGetMessage(verifyCode) {
  return `Your code is ${verifyCode}`;
}

export default function SMSAuthMethod({ agent, getMessage }) {
  const authMethodName = 'sms';
  function identifyInfo(verificationInfo) {
    if (!verificationInfo || !verificationInfo.number) {
      return null;
    }
    return String(verificationInfo.number);
  }
  async function sendVerification(verificationInfo, verifyCode, accountId) {
    const message = getMessage
      ? await getMessage(verifyCode, verificationInfo, accountId)
      : await defaultGetMessage(verifyCode, verificationInfo, accountId);
    await agent.actions.SendSMS({
      to: verificationInfo.number,
      message,
    });
  }

  return createMessageAuthMethod({
    authMethodName,
    sendVerification,
    identifyInfo,
  });
}
