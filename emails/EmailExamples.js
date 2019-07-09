import SendReceiptEmail from './SendReceiptEmail';

const EmailExamples = {
  SendReceipt: {
    template: SendReceiptEmail,
    paramOptions: {
      SmallOrder: { total: '$6.50' },
      LargeOrder: { total: '$26.50' },
    },
  },
};

export default EmailExamples;
