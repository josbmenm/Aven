import SendReceiptEmail from './SendReceiptEmail';
import ThankyouEmail from './ThankyouEmail';
import RefundEmail from './RefundEmail';

const Emails = {
  SendReceipt: SendReceiptEmail,
  Thankyou: ThankyouEmail,
  Refund: RefundEmail,
};

export async function sendEmailDO_NOT_USE_ME(
  agent,
  { recipient, templateName, params },
) {
  // do not use this. it is an older dev utility. Instead use the agent's SendEmailTemplate action directly
  const template = Emails[templateName];
  if (!template) {
    throw new Error('Unknown template ');
  }

  const messageHTML = template.getBodyHTML(params);
  const message = template.getBodyText(params);
  const subject = template.getSubject(params);
  if (recipient) {
    await agent.actions.SendEmail({
      to: recipient,
      subject,
      message,
      messageHTML,
    });
  }
  return {
    bodyHTML: messageHTML,
    bodyText: message,
    subject,
    recipient,
  };
}

export default Emails;
