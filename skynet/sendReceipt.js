import React from 'react';
import {
  render,
  Mjml,
  MjmlHead,
  MjmlTitle,
  MjmlPreview,
  MjmlBody,
  MjmlSection,
  MjmlColumn,
  MjmlButton,
  MjmlImage,
} from 'mjml-react';

function Header({ title, metaTitle }) {
  return (
    <MjmlHead>
      <mj-font
        name="MaaxBold"
        href="http://onofood.co/fonts/Maax%20-%20Bold-205TF/Maax%20-%20Bold-205TF.woff2"
      />
      <MjmlTitle>{title}</MjmlTitle>
      <MjmlPreview>{metaTitle}</MjmlPreview>
    </MjmlHead>
  );
}

async function sendSMSReceipt(smsAgent, action, logger) {
  logger.log('SMS Sent', 'SendSMS');
  await smsAgent.actions.SendSMS({
    to: action.contact.value,
    message: 'Thank you for your order, ❤️ Ono Blends',
  });
}
async function sendEmailReceipt(emailAgent, action, logger) {
  logger.log('Email Sent', 'SendEmail');
  const { html, errors } = render(
    <Mjml>
      <Header
        title="Thank you for ordering from Ono Blends"
        metaTitle="Your receipt for $8.88"
      />
      <MjmlBody width={500}>
        <MjmlSection fullWidth backgroundColor="#f7f7f7">
          <MjmlColumn>
            <MjmlImage src="https://onofood.co/img/icons.svg" />
          </MjmlColumn>
        </MjmlSection>
        <MjmlSection>
          <MjmlColumn>
            <MjmlButton
              padding="20px"
              backgroundColor="#346DB7"
              href="https://onofood.co"
            >
              sign up for updates from ono
            </MjmlButton>
          </MjmlColumn>
        </MjmlSection>
      </MjmlBody>
    </Mjml>,
    { validationLevel: 'soft' },
  );
  if (errors.length) {
    throw new Error('Cannot construct email!', errors);
  }
  await emailAgent.actions.SendEmail({
    to: action.contact.value,
    subject: 'Your purchase from Ono Blends',
    message: 'Thanks for your order! \n\n -The Ono Blends Team',
    messageHTML: html,
    // from
    // fromName
  });
}

export default async function sendReceipt({
  cloud,
  smsAgent,
  emailAgent,
  action,
  logger,
}) {
  if (!action.contact) {
    throw new Error('Invalid SendReceipt action');
  }
  if (action.contact.type === 'sms') {
    return await sendSMSReceipt(smsAgent, action, logger);
  }
  if (action.contact.type === 'email') {
    return await sendEmailReceipt(emailAgent, action, logger);
  }
  return;
}
