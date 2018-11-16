import React from 'react';
import { View, Text, TouchableHighlight } from 'react-native';
import JSONView from '../../debug-views/JSONView';
import { paymentContainer } from '../Payments';
import GenericPage from '../components/GenericPage';
import Hero from '../../components/Hero';

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
        <GenericPage>
          <Text>Thank You!</Text>
          <JSONView data={paymentActivityLog} />
        </GenericPage>
      );
    }
    if (paymentError) {
      return (
        <GenericPage>
          <Text>Error: {paymentError}</Text>
          <JSONView data={paymentActivityLog} />
        </GenericPage>
      );
    }
    if (isPaymentReady) {
      return (
        <GenericPage>
          <Hero title="Payment Test Screen" />
          <TouchableHighlight
            onPress={() => {
              paymentRequest(100, 'Hello ono!');
            }}
          >
            <Text style={{ fontSize: 32 }}>Take Money</Text>
          </TouchableHighlight>
          <JSONView data={paymentActivityLog} />
        </GenericPage>
      );
    }

    return (
      <GenericPage>
        <JSONView data={paymentActivityLog} />
      </GenericPage>
    );
  },
);

export default CollectPaymentScreen;
