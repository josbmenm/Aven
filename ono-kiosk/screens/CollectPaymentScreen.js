import React from 'react';
import { View, Text } from 'react-native';
import JSONView from '../../debug-views/JSONView';
import { openSettings, paymentContainer } from './Payments';

const CollectPaymentScreen = paymentContainer(
  ({
    paymentRequest,
    paymentError,
    isPaymentReady,
    isPaymentComplete,
    paymentActivityLog,
  }) => {
    if (isPaymentComplete) {
      return (
        <View style={{ flex: 1 }}>
          <Text>Thank You!</Text>
          <JSONView data={paymentActivityLog} />
        </View>
      );
    }
    if (paymentError) {
      return (
        <View style={{ flex: 1 }}>
          <Text>Error: {paymentError}</Text>
          <JSONView data={paymentActivityLog} />
        </View>
      );
    }
    if (isPaymentReady) {
      return (
        <View style={{ flex: 1 }}>
          <TouchableHighlight
            onPress={() => {
              paymentRequest(100, 'Hello ono!');
            }}
          >
            <Text style={{ fontSize: 32 }}>Take Money</Text>
          </TouchableHighlight>
          <JSONView data={paymentActivityLog} />
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <JSONView data={paymentActivityLog} />
      </View>
    );
  },
);

export default CollectPaymentScreen;
