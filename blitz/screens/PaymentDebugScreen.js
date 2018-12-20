import React from 'react';
import { View, Text, TouchableHighlight } from 'react-native';
import JSONView from '../../debug-views/JSONView';
import { paymentContainer } from '../Payments';
import GenericPage from '../components/GenericPage';
import Hero from '../../components/Hero';
import Button from '../../components/Button';

import { useCardReader, readerIsReady } from '../CardReader';
import useObservable from '../../aven-cloud/useObservable';
import RowSection from '../../components/RowSection';
import TextRow from '../../components/TextRow';
import BitRow from '../../components/BitRow';

function ObservableBitRow({ value, title }) {
  const currentValue = useObservable(value);
  return <BitRow value={currentValue} title={title} />;
}

function ObservableJSONRow({ value, title }) {
  const currentValue = useObservable(value);
  return <TextRow text={JSON.stringify(currentValue)} title={title} />;
}

export default function PaymentDebugScreen() {
  const {
    getPayment,
    cancelPayment,
    readerStatus,
    readerIsReady,
    readerIsWaitingForInput,
    readerHasCardInserted,
    readerAllowedPaymentOptions,
    readerPrompt,
  } = useCardReader();
  return (
    <GenericPage>
      <Hero title="Payment Debugging" />
      <RowSection>
        <ObservableBitRow title="Reader is Ready" value={readerIsReady} />
        <ObservableBitRow
          title="Is waiting for payment"
          value={readerIsWaitingForInput}
        />
        <ObservableBitRow
          title="Card is inserted"
          value={readerHasCardInserted}
        />
        <ObservableJSONRow title="Status" value={readerStatus} />
        <ObservableJSONRow title="Prompt" value={readerPrompt} />
        <ObservableJSONRow
          title="Allowed Payment Methods"
          value={readerAllowedPaymentOptions}
        />
        <Button
          title="Cancel Payment"
          onPress={() => {
            cancelPayment()
              .then(() => {
                console.log('==== JS Payment Cancelled');
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
              .catch(e => console.error(e));
          }}
        />
      </RowSection>
    </GenericPage>
  );
}
