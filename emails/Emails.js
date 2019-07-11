import SendReceiptEmail from './SendReceiptEmail';
import ThankyouEmail from './ThankyouEmail'
import RefundEmail from './RefundEmail';

const Emails = {
  SendReceipt: SendReceiptEmail,
  Thankyou: ThankyouEmail,
  Refund: RefundEmail
};

export async function sendEmail(agent, { recipient, templateName, params }) {
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
