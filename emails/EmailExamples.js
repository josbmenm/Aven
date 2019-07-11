const EmailExamples = {
  SendReceipt: {
    template: 'SendReceiptEmail',
    paramOptions: {
      SmallOrder: {
        orderDetails: {
          displayItems: [
            {
              label: 'Avocado + Matcha',
              amount: 595,
            },
          ],
          subTotal: {
            label: 'Subtotal',
            amount: 595,
          },
          tax: {
            label: 'Tax',
            amount: 55,
          },
          total: {
            label: 'Amount Charged',
            amount: 650,
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
              amount: 595,
            },
            {
              label: 'Strawberry + Dragon Fruit',
              amount: 595,
            },
            {
              label: 'Mango + Turmeric',
              amount: 595,
            },
          ],
          subTotal: {
            label: 'Subtotal',
            amount: 1785,
          },
          tax: {
            label: 'Tax',
            amount: 170,
          },
          total: {
            label: 'Amount Charged',
            amount: 1955,
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
      params: {
        promocode: 'PROMOCODETEST',
      },
    },
  },
  Refund: {
    template: 'RefundEmail',
    paramOptions: {
      params: {
        refund: {
          label: '',
          amount: 650,
        },
      },
    },
  },
};

export default EmailExamples;
