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

AppEmitter.addListener('OPaymentCancelled', response =>
  alert('ono payment cancelled! ' + JSON.stringify(response)),
);
AppEmitter.addListener('OPaymentComplete', response =>
  alert('YAY, ono payment complete! ' + JSON.stringify(response)),
);
AppEmitter.addListener('OPaymentError', response =>
  alert('ono payment error! ' + JSON.stringify(response)),
);

// subscription.remove();

export class PaymentsDebugScreen extends Component {
  async componentDidMount() {
    let res = null;
    console.log('============================');
    try {
      res = await OnoClient.dispatch({
        type: 'getSquareMobileAuthToken',
      });
    } catch (e) {
      console.log('wut', e);
    }
    console.log('!============================');
    console.log(res);
    // OPaymentManager.setup({});
  }
  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{}}>{JSON.stringify(OPaymentManager)}</Text>
        <Text
          style={{ fontSize: 42 }}
          onPress={async () => {
            const result = await new Promise(resolve => {
              OPaymentManager.getPermissions(resolve);
            });

            alert(JSON.stringify(result));
          }}
        >
          Get permissions
        </Text>
        <Text
          style={{ fontSize: 42 }}
          onPress={() => {
            OPaymentManager.getPayment(100, 'yes react native');
          }}
        >
          Pay me!
        </Text>
      </View>
    );
  }
}
