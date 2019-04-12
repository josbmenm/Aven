const kuid = require('kuid');

const sg = require('@sendgrid/mail');

export default function EmailAgent({ config, defaultFromEmail, name }) {
  const { sendgridAPIKey } = config;
  name = name || `email-sendgrid-${kuid()}`;

  sg.setApiKey(sendgridAPIKey);

  const actions = {
    SendEmail: async ({ to, subject, message, from, fromName }) => {
      const finalFromEmail = from ? `${fromName} <${from}>` : defaultFromEmail;

      await sg.send({
        to,
        from: finalFromEmail,
        subject,
        text: message,
        // html: '<strong>coming soon</strong>',
      });
    },
  };

  return { actions, remove: () => {}, name };
}
