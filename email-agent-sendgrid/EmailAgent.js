const cuid = require('cuid');

const sg = require('@sendgrid/mail');

export default function EmailAgent({ config, defaultFromEmail, name }) {
  const { sendgridAPIKey } = config;
  name = name || `email-sendgrid-${cuid()}`;

  sg.setApiKey(sendgridAPIKey);

  const actions = {
    SendEmail: async ({
      to,
      subject,
      message,
      messageHTML,
      from,
      fromName,
    }) => {
      const finalFromEmail = from ? `${fromName} <${from}>` : defaultFromEmail;

      await sg.send({
        to,
        from: finalFromEmail,
        subject,
        text: message,
        html: messageHTML,
      });
    },
  };

  return { actions, remove: () => {}, name };
}
