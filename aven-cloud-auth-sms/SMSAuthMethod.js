import createMessageAuthMethod from '../aven-cloud-auth-message/createMessageAuthMethod';

export default function SMSAuthMethod({ agent }) {
  const authMethodName = 'sms';
  function identifyAuthInfo(authInfo) {
    if (!authInfo || !authInfo.number) {
      return null;
    }
    return String(authInfo.number);
  }
  async function sendVerification(authInfo, verifyCode) {
    await agent.actions.SendSMS({
      to: authInfo.number,
      message: `Your code is ${verifyCode}`,
    });
  }

  return createMessageAuthMethod({
    authMethodName,
    sendVerification,
    identifyAuthInfo,
  });
}
//   function checkRecognizedInfo(authInfo) {
//     if (authInfo.smsPhone) {
//       return true;
//     }
//     return false;
//   }

//   async function getMethodId(authInfo) {}

//   async function requestVerification(authInfo, methodState) {
//     return {
//       verificationChallenge: {},
//       authInfo
//     };
//   }

//   async function performVerification(
//     authInfo,
//     methodState,
//     verificationResponse
//   ) {
//     return {
//       authInfo
//     };
//   }

//   return {
//     checkRecognizedInfo,
//     requestVerification,
//     performVerification,
//     getMethodId
//   };
// }
