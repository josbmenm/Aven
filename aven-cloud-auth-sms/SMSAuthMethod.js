import createMessageAuthMethod from '../aven-cloud-auth-message/createMessageAuthMethod';

export default function SMSAuthMethod({ agent }) {
  const authMethodName = 'sms';
  function identifyInfo(verificationInfo) {
    if (!verificationInfo || !verificationInfo.number) {
      return null;
    }
    return String(verificationInfo.number);
  }
  async function sendVerification(verificationInfo, verifyCode) {
    await agent.actions.SendSMS({
      to: verificationInfo.number,
      message: `Your code is ${verifyCode}`,
    });
  }

  return createMessageAuthMethod({
    authMethodName,
    sendVerification,
    identifyInfo,
  });
}
