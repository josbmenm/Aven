const uuid = require('uuid/v1');
const Twilio = require('twilio');

export default function SMSAgent({ config, defaultFromNumber, name }) {
  const { accountSid, authToken } = config;
  name = name || `sms-twilio-${uuid()}`;

  const t = Twilio(accountSid, authToken);

  const actions = {
    SendSMS: async ({ to, message, fromNumber }) => {
      const finalFromNumber = fromNumber || defaultFromNumber;

      await t.messages.create({
        body: message,
        from: '+' + finalFromNumber,
        to: '+' + to,
      });
    },
  };

  return { actions, remove: () => {}, name };
}
