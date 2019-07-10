const EmailExamples = {
  SendReceipt: {
    template: 'SendReceiptEmail',
    paramOptions: {
      SmallOrder: {
        orderDetails: {
          displayItems: [
            {
              label: 'Avocado + Matcha',
              amount: { currency: 'USD', value: '5.95' },
            },
          ],
          subTotal: {
            label: 'Subtotal',
            amount: { currency: 'USD', value: '5.95' },
          },
          tax: {
            label: 'Tax',
            amount: { currency: 'USD', value: '0.55' },
          },
          total: {
            label: 'Amount Charged',
            amount: { currency: 'USD', value: '6.50' },
          },
          paymentMethod: {
            methodName: 'basic-card',
            network: 'VISA',
            cardNumber: '7379',
          },
        },
        promocode: 'STEPHENK573',
      },
      LargeOrder: {
        orderDetails: {
          displayItems: [
            {
              label: 'Avocado + Matcha',
              amount: { currency: 'USD', value: '5.95' },
            },
            {
              label: 'Strawberry + Dragon Fruit',
              amount: { currency: 'USD', value: '5.95' },
            },
            {
              label: 'Mango + Turmeric',
              amount: { currency: 'USD', value: '5.95' },
            },
          ],
          subTotal: {
            label: 'Subtotal',
            amount: { currency: 'USD', value: '17.85' },
          },
          tax: {
            label: 'Tax',
            amount: { currency: 'USD', value: '1.70' },
          },
          total: {
            label: 'Amount Charged',
            amount: { currency: 'USD', value: '19.55' },
          },
          paymentMethod: {
            methodName: 'basic-card',
            network: 'VISA',
            cardNumber: '7379',
          },
        },
        promocode: 'STEPHENK573',
      },
    },
  },
  Thankyou: {
    template: 'ThankyouEmail',
    paramOptions: {
      promocode: 'PROMOCODETEST',
    },
  },
};

export default EmailExamples;
