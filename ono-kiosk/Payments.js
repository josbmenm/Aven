import React, { Component } from 'react';
import { NativeModules, NativeEventEmitter } from 'react-native';

const OPaymentManager = NativeModules.OPaymentManager;

const AppEmitter = new NativeEventEmitter(
  NativeModules.ReactNativeEventEmitter,
);

const setupPayment = authCode =>
  new Promise((resolve, reject) => {
    OPaymentManager.setup(authCode, (err, resp) => {
      console.log(err, resp);
      if (err) {
        reject(err);
      } else {
        resolve(resp);
      }
    });
  });

const getPayment = (price, description) =>
  OPaymentManager.getPayment(price, description);

export const configurePayment = async () => {
  throw new Error('need network access, yo!');
  // const res = await dispatch({
  //   type: 'getSquareMobileAuthToken',
  // });
  const authCode = res.result.authorization_code;
  await setupPayment(authCode);
};

export const openSettings = async () => {
  await configurePayment();
  await new Promise(resolve => {
    OPaymentManager.openSettings((err, resp) => {
      if (err) {
        reject(err);
      } else {
        resolve(resp);
      }
    });
  });
};

// AppEmitter.addListener('OPaymentCancelled', response =>
//   alert('ono payment cancelled! ' + JSON.stringify(response)),
// );
// AppEmitter.addListener('OPaymentComplete', response =>
//   alert('YAY, ono payment complete! ' + JSON.stringify(response)),
// );
// AppEmitter.addListener('OPaymentError', response =>
//   alert('ono payment error! ' + JSON.stringify(response)),
// );

export const paymentContainer = PaymentComponent => {
  class PaymentsContainer extends Component {
    state = { isReady: false, error: null, isComplete: false, activityLog: [] };
    _handleActivity = (event, stateFlags) => {
      this.setState(lastState => ({
        ...lastState,
        ...stateFlags,
        activityLog: [...lastState.activityLog, event],
      }));
    };
    _handlePayComplete = response => {
      this._handleActivity(
        { type: 'PaymentComplete', ...response },
        { isComplete: true },
      );
    };
    _handlePayError = response => {
      console.error('Payment Error', response);
      this._handleActivity(
        { type: 'PaymentError', ...response },
        { error: 'Payment Collection Error' },
      );
    };
    _handlePayCancel = response => {
      this._handleActivity({ type: 'PaymentCancelled', ...response });
    };

    async componentDidMount() {
      AppEmitter.addListener('OPaymentComplete', this._handlePayComplete);
      AppEmitter.addListener('OPaymentError', this._handlePayError);
      AppEmitter.addListener('OPaymentCancelled', this._handlePayCancel);

      try {
        this._handleActivity({ type: 'PaymentConfigRequested' });
        const config = await configurePayment();
        this._handleActivity(
          { type: 'PaymentConfigured', ...config },
          { isReady: true },
        );
      } catch (error) {
        console.error(error);
        this._handleActivity(
          { type: 'PaymentError', error },
          { error: 'Payment Authorization Error' },
        );
      }
    }
    componentWillUnmount() {
      AppEmitter.removeListener('OPaymentComplete', this._handlePayComplete);
      AppEmitter.removeListener('OPaymentError', this._handlePaymentError);
      AppEmitter.removeListener('OPaymentCancelled', this._handlePayCancel);
    }
    _getPayment = (amount, description) => {
      getPayment(amount, description);
      this._handleActivity({ type: 'PaymentRequested', amount, description });
    };
    render() {
      const { isComplete, isReady, error, activityLog } = this.state;
      return (
        <PaymentComponent
          isPaymentReady={isReady}
          isPaymentComplete={isComplete}
          paymentRequest={this._getPayment}
          paymentError={error}
          paymentActivityLog={activityLog}
        />
      );
    }
  }
  return PaymentsContainer;
};
