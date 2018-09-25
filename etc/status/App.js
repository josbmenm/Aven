import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { connectComponent, OnoClient } from './DataClient';

const sectionText = {
  color: '#222',
  fontSize: 120,
};

const nameText = {
  fontSize: 120,
  fontWeight: 'bold',
  color: '#111',
};

class TimerText extends React.Component {
  state = { t: 59 };
  componentDidMount() {
    this.decrementToZero();
  }
  decrementToZero = () => {
    if (this.state.t > 0) {
      setTimeout(() => {
        this.setState(s => ({
          t: s.t - 1,
        }));
        this.decrementToZero();
      }, 1000);
    }
  };
  render() {
    const { t } = this.state;
    return (
      <Text>
        0:
        {t}
      </Text>
    );
  }
}

const withTruckState = Component => {
  const ComponentWithData = connectComponent(Component);
  return () => (
    <ComponentWithData
      truckState={OnoClient.getRef('truckState').watchObject()}
    />
  );
};

const PickupBay = ({ pickupReadyName }) => {
  if (pickupReadyName) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          backgroundColor: '#CB8A43',
        }}
      >
        <Text
          style={{
            ...sectionText,
            fontSize: 80,
            textAlign: 'center',
            color: 'white',
          }}
        >
          Pickup Ready
        </Text>
        <Text style={{ ...nameText, textAlign: 'center', color: 'white' }}>
          {pickupReadyName}
        </Text>
      </View>
    );
  }
  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <Text style={{ ...sectionText, textAlign: 'center', color: '#aaa' }}>
        Empty
      </Text>
    </View>
  );
};

const Pickup = ({ state }) => (
  <View style={{ flexDirection: 'row', flex: 1 }}>
    <PickupBay pickupReadyName={state.pickupA} />
    <PickupBay pickupReadyName={state.pickupB} />
  </View>
);

const BlendingNow = withTruckState(({ truckState }) => {
  const state = truckState.getValue();
  if (!state || !state.value) {
    return null;
  }
  return (
    <View
      style={{
        backgroundColor: '#E9C6A0',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          ...sectionText,
          margin: 40,
        }}
      >
        Blending Now:
        <Text
          style={{
            ...nameText,
            textAlign: 'right',
          }}
        >
          {state.value.customerName}
        </Text>
      </Text>
    </View>
  );
});

const QueuedItem = ({ name }) => (
  <Text
    style={{
      ...nameText,
      textAlign: 'center',
      marginVertical: 10,
    }}
  >
    {name}
  </Text>
);
const Queue = ({ state }) => (
  <View
    style={{
      flex: 2,
      justifyContent: 'flex-end',
      paddingVertical: 15,
    }}
  >
    {state.queue.reverse().map(queueItem => (
      <QueuedItem {...queueItem} key={queueItem.name} />
    ))}
  </View>
);

const blendState = {
  queue: [{ name: 'Jan' }, { name: 'Joe' }, { name: 'Jen' }, { name: 'Jon' }],
  blendingNow: 'Bob',
  pickupA: 'Jane',
  pickupB: null,
};

const BlendScreen = ({ state }) => (
  <View style={{ flex: 1 }}>
    <Queue state={state} />
    <BlendingNow state={state} />
    <Pickup state={state} />
  </View>
);

export default class App extends Component {
  render() {
    return <BlendScreen state={blendState} />;
  }
}
