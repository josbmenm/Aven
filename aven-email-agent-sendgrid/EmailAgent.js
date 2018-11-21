const uuid = require("uuid/v1");

const sg = require("@sendgrid/mail");

export default function EmailAgent({ config, defaultFromEmail, name }) {
  const { sendgridAPIKey } = config;
  name = name || `email-sendgrid-${uuid()}`;

  sg.setApiKey(sendgridAPIKey);

  const actions = {
    sendEmail: async ({ to, subject, message, from, fromName }) => {
      const finalFromEmail = from ? `${fromName} <${from}>` : defaultFromEmail;

      await sg.send({
        to,
        from: finalFromEmail,
        subject,
        text: message
        // html: '<strong>coming soon</strong>',
      });
    }
  };

  return { actions, remove: () => {}, name };
}
