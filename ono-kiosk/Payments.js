import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  Modal,
  View,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';

import { OnoClient } from '../save-client/DataClient';

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

const getPayment = async (price, description) =>
  OPaymentManager.getPayment(price, description);

export const configurePayment = async () => {
  const res = await OnoClient.dispatch({
    type: 'getSquareMobileAuthToken',
  });
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
    state = { isReady: false, error: null, isComplete: false };
    _handlePaymentComplete = response => {
      this.setState({ isComplete: true });
    };
    _handlePaymentError = response => {
      this.setState({ error: 'Payment Collection Error' });
    };
    _handlePaymentCancel = response => {
      // alert('ono payment cancelled! ' + JSON.stringify(response));
    };

    async componentDidMount() {
      AppEmitter.addListener('OPaymentComplete', this._handlePaymentComplete);
      AppEmitter.addListener('OPaymentError', this._handlePaymentError);
      AppEmitter.addListener('OPaymentCancelled', this._handlePaymentCancel);

      try {
        await configurePayment();
        this.setState({ isReady: true });
      } catch (e) {
        console.error(e);
        this.setState({ isReady: false, error: 'Payment Authorization Error' });
      }
    }
    componentWillUnmount() {
      AppEmitter.removeListener(
        'OPaymentComplete',
        this._handlePaymentComplete,
      );
      AppEmitter.removeListener('OPaymentError', this._handlePaymentError);
      AppEmitter.removeListener('OPaymentCancelled', this._handlePaymentCancel);
    }
    _requestPayment = (amount, description) => {
      getPayment(amount, description)
        .then(() => {
          this.setState({ isReady: true });
        })
        .catch(e => {
          console.error(e);
          this.setState({
            isReady: false,
            error: 'Payment Authorization Error',
          });
        });
    };
    render() {
      const { isComplete, isReady, error } = this.state;
      return (
        <PaymentComponent
          isPaymentReady={isReady}
          isPaymentComplete={isComplete}
          paymentRequest={this._requestPayment}
          paymentError={error}
        />
      );
    }
  }
  return PaymentsContainer;
};
