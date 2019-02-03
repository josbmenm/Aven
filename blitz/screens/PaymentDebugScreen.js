import React, { useState } from 'react';
import { View, Text, TouchableHighlight, Alert } from 'react-native';
import JSONView from '../../debug-views/JSONView';
import GenericPage from '../components/GenericPage';
import Hero from '../../components/Hero';
import Button from '../../components/Button';

import { useCardReader, useCardPaymentCapture } from '../CardReader';
import useObservable from '../../aven-cloud/useObservable';
import RowSection from '../../components/RowSection';
import TextRow from '../../components/TextRow';
import BitRow from '../../components/BitRow';
import { rowStyle } from '../../components/Styles';

function ObservableBitRow({ value, title }) {
  const currentValue = useObservable(value);
  return <BitRow value={currentValue} title={title} />;
}

function ObservableJSONRow({ value, title }) {
  const currentValue = useObservable(value);
  return <TextRow text={JSON.stringify(currentValue)} title={title} />;
}

function FullPaymentExample() {
  const {
    stateMessage,
    hasRequestedPayment,
    hasCompleted,
    hasCompletedPayment,
    declinedWithMessage,
    state,
  } = useCardPaymentCapture(
    {
      amount: 123,
      description: 'Full workflow payment',
    },
    result => {
      Alert.alert('Money recieved!', JSON.stringify(result));
    },
  );
  return (
    <View style={{ ...rowStyle }}>
      <JSONView
        data={{
          state,
          hasRequestedPayment,
          stateMessage,
          hasCompleted,
          hasCompletedPayment,
          declinedWithMessage,
        }}
      />
    </View>
  );
}

function UseCardExample() {
  const {
    getPayment,
    cancelPayment,
    prepareReader,
    readerState,
    readerStatus,
    readerIsReady,
    readerHasCardInserted,
  } = useCardReader();
  return (
    <React.Fragment>
      <ObservableBitRow title="Reader is Ready" value={readerIsReady} />
      <ObservableBitRow
        title="Card is inserted"
        value={readerHasCardInserted}
      />
      <ObservableJSONRow title="State" value={readerState} />
      <ObservableJSONRow title="Status" value={readerStatus} />
      <Button
        title="Prepare Reader"
        onPress={() => {
          prepareReader()
            .then(() => {
              alert('Prepare Reader Done');
            })
            .catch(e => console.error(e));
        }}
      />
      <Button
        title="Cancel Payment"
        onPress={() => {
          cancelPayment()
            .then(() => {
              alert('Cancel Payment Done');
            })
            .catch(e => console.error(e));
        }}
      />

      <Button
        title="Take $1.11"
        onPress={() => {
          getPayment(111, 'Hello Stripe in my App!')
            .then(() => {
              console.log('==== JS THANKS FOR YOUR MONEY');
            })
            .catch(e => {
              if (e.code === 20) {
                // payment was cancelled manually
                return;
              }
              console.error(e);
            });
        }}
      />
    </React.Fragment>
  );
}

export default function PaymentDebugScreen(props) {
  const [isShowingFullExample, setFullExample] = useState(false);
  const [isShowingUseCard, setUseCard] = useState(false);
  return (
    <GenericPage {...props}>
      <Hero title="Card Reader Debugging" icon="💸" />
      <RowSection>
        <Button
          title="Test useCardPaymentCapture"
          onPress={() => {
            setFullExample(!isShowingFullExample);
          }}
        />
        {isShowingFullExample && <FullPaymentExample />}

        <Button
          title="Test useCardReader"
          onPress={() => {
            setUseCard(!isShowingUseCard);
          }}
        />
        {isShowingUseCard && <UseCardExample />}
      </RowSection>
    </GenericPage>
  );
}

PaymentDebugScreen.navigationOptions = GenericPage.navigationOptions;
