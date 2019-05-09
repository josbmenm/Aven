import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableHighlight,
  Alert,
  ScrollView,
  AlertIOS,
} from 'react-native';
import JSONView from './JSONView';
import Button from './Button';
import {
  CardReaderLog,
  useCardReader,
  useCardPaymentCapture,
  useCardReaderConnectionManager,
  disconnectReader,
  clearReaderLog,
} from '../card-reader/CardReader';
import useObservable from '../cloud-core/useObservable';
import RowSection from './RowSection';
import TextRow from './TextRow';
import Row from './Row';
import BitRow from './BitRow';
import { rowStyle, rowTitleStyle } from './Styles';
import SimplePage from './SimplePage';

function ObservableBitRow({ value, title }) {
  // const currentValue = useObservable(value);
  return <BitRow value={value} title={title} />;
}

function ObservableJSONRow({ value, title }) {
  // const currentValue = useObservable(value);
  return <TextRow text={JSON.stringify(value)} title={title} />;
}

function PaymentManagerScreen() {
  const {
    managerConnectionStatus, // connected | connecting | disconnected | scanning
    readersAvailable,
    connectedReader,
    persistedReaderSerialNumber,
    connectReader,
    disconnectReader,
    discoverReaders,
  } = useCardReaderConnectionManager();

  return (
    <React.Fragment>
      <TextRow
        title="Manager connection status"
        text={managerConnectionStatus}
      />
      <TextRow title="Persisted reader" text={persistedReaderSerialNumber} />
      <RowSection>
        {readersAvailable.map(
          ({
            serialNumber,
            batteryLevel,
            deviceType,
            deviceSoftwareVersion,
          }) => {
            return (
              <Row key={serialNumber}>
                <Text
                  style={{ flex: 1, alignSelf: 'center', fontSize: 18 }}
                >{`${serialNumber} | ${deviceType ||
                  'unknown type'} | ${deviceSoftwareVersion ||
                  'unknown version'} (${(
                  batteryLevel * 100
                ).toFixed()}%)`}</Text>
                <Button
                  title={
                    connectedReader &&
                    connectedReader.serialNumber === serialNumber
                      ? 'Connected'
                      : 'Connect'
                  }
                  onPress={() => connectReader(serialNumber)}
                />
              </Row>
            );
          },
        )}
      </RowSection>
      <Button title="Discover readers" onPress={() => discoverReaders()} />
      <Button title="Disconnect reader" onPress={() => disconnectReader()} />
    </React.Fragment>
  );
}

function FullPaymentExample() {
  const {
    paymentSuccessful,
    paymentCompleted,
    paymentErrorMessage,
    displayMessage,
    state,
  } = useCardPaymentCapture({
    amount: 123,
    description: 'Full workflow payment',
    onCompletion: result => {
      Alert.alert('Money received and card removed!', JSON.stringify(result));
    },
    onFailure: err => {
      Alert.alert('Failed to create payment!', JSON.stringify(err));
    },
  });

  return (
    <React.Fragment>
      <ObservableBitRow title="Payment successful" value={paymentSuccessful} />
      <ObservableBitRow title="Payment completed" value={paymentCompleted} />
      <View style={{ ...rowStyle }}>
        <JSONView
          data={{
            displayMessage,
            paymentErrorMessage,
            state: {
              ...state,
              capturedPaymentIntent: JSON.stringify(
                state.capturedPaymentIntent,
              ),
            },
          }}
        />
      </View>
    </React.Fragment>
  );
}

function UseCardExample() {
  const {
    collectPayment,
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
        title="Disconnect Reader"
        onPress={() => {
          disconnectReader()
            .then(() => {
              alert('Disconnected');
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
          collectPayment({
            amount: 111,
            description: 'Hello Stripe in my App!',
            currency: 'usd',
          })
            .then(intent => {
              console.log('==== JS THANKS FOR YOUR MONEY', intent);
            })
            .catch(e => {
              if (e.code === 102) {
                console.log('==== payment cancelled manually', e);
                return;
              }
              console.error(e);
            });
        }}
      />

      <Button
        title="Take custom amount"
        onPress={() => {
          AlertIOS.prompt(
            'Enter an amount to collect.',
            'Last 2 digits\n=============\n' +
              '00  Payment is approved.\n' +
              '01  Payment is declined with a call_issuer code.\n' +
              '05  Payment is declined with a generic_decline code.\n' +
              '55  Payment is declined with an incorrect_pin code.\n' +
              '65  Payment is declined with a withdrawal_count_limit_exceeded code.\n' +
              '75  Payment is declined with a pin_try_exceeded code.',
            text => {
              collectPayment({
                amount: +text,
                description: 'Custom payment test',
                currency: 'usd',
              })
                .then(intent => {
                  Alert.alert('Got yo money!', JSON.stringify(intent));
                })
                .catch(e => {
                  if (e.code === 102) {
                    Alert.alert('Sad, you canceled :(', JSON.stringify(e));
                    return;
                  }

                  Alert.alert('Failed to get yo money', JSON.stringify(e));
                });
            },
          );
        }}
      />
    </React.Fragment>
  );
}

function ReaderEvents() {
  const log = useObservable(CardReaderLog);
  return (
    <React.Fragment>
      <Text style={{ ...rowStyle, ...rowTitleStyle }}>Events</Text>
      <RowSection>
        {log.map(evt => {
          return <TextRow key={evt.event + evt.time} text={evt.event} />;
        })}
      </RowSection>
      <Button onPress={clearReaderLog} title="Clear Log" />
    </React.Fragment>
  );
}

export default function PaymentDebugScreen(props) {
  const [isShowingManager, setManager] = useState(false);
  const [isShowingFullExample, setFullExample] = useState(false);
  const [isShowingUseCard, setUseCard] = useState(false);
  return (
    <SimplePage title="Card Reader Debugging" icon="💸" {...props}>
      <RowSection>
        <Button
          title="HOME"
          onPress={() => {
            props.navigation.navigate('Home');
          }}
        />
        <Button
          title="Test useCardReaderConnectionManager"
          onPress={() => {
            setManager(!isShowingManager);
          }}
        />
        {isShowingManager && <PaymentManagerScreen />}

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

        <ReaderEvents />
      </RowSection>
    </SimplePage>
  );
}

PaymentDebugScreen.navigationOptions = SimplePage.navigationOptions;
