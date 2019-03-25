import React, { useState, useReducer } from 'react';
import { View, Text, Animated, Button } from 'react-native';

import useCloudState from '../cloud-core/useCloudState';
import useCloudReducer from '../cloud-core/useCloudReducer';
import CloudContext from '../cloud-core/CloudContext';
import OnoCloud from './OnoCloud';

import { createSwitchNavigator } from '../navigation-core';
import { createAppContainer } from '../navigation-native';
import { monsterra } from '../components/Styles';

const SCREEN_WIDTH = 1080;
const ASPECT_RATIO = 16 / 9;

function StatusDisplayLayout({ children, backgroundColor, debugView }) {
  const [scale] = useState(new Animated.Value(1));
  const [translateY] = useState(new Animated.Value(0));
  const [translateX] = useState(new Animated.Value(0));
  return (
    <View
      style={{ flex: 1, backgroundColor: '#eee' }}
      onLayout={e => {
        let screenH = e.nativeEvent.layout.height;
        let screenW = e.nativeEvent.layout.width;
        if (screenW * ASPECT_RATIO > screenH) {
          const theScale = screenH / (SCREEN_WIDTH * ASPECT_RATIO);
          const theTranslateX = (screenW - SCREEN_WIDTH) / 2;
          const theTranslateY = (screenH - SCREEN_WIDTH * ASPECT_RATIO) / 2;
          scale.setValue(theScale);
          translateX.setValue(theTranslateX);
          translateY.setValue(theTranslateY);
        } else {
          const theScale = screenW / SCREEN_WIDTH;
          const theTranslateX = (screenW - SCREEN_WIDTH) / 2;
          const theTranslateY = (screenH - SCREEN_WIDTH * ASPECT_RATIO) / 2;
          scale.setValue(theScale);
          translateX.setValue(theTranslateX);
          translateY.setValue(theTranslateY);
        }
      }}
    >
      <Animated.View
        style={{
          width: SCREEN_WIDTH,
          height: SCREEN_WIDTH * ASPECT_RATIO,
          transform: [{ translateX }, { translateY }, { scale }],
          backgroundColor: 'red',
        }}
      >
        {children}
      </Animated.View>
      {debugView}
    </View>
  );
}

function StatusDisplayRow({ title }) {
  return (
    <View
      style={{ backgroundColor: monsterra, height: 100, paddingHorizontal: 20 }}
    >
      <Text style={{ fontSize: 62, color: 'white' }}>{title}</Text>
    </View>
  );
}

function OrderRow({ orderName, status, productName }) {
  return (
    <View style={{ paddingHorizontal: 20 }}>
      <Text>{orderName}</Text>
      <Text>{productName}</Text>
    </View>
  );
}

function PresentationSection() {
  return (
    <View style={{ alignSelf: 'stretch', aspectRatio: 1, borderWidth: 1 }} />
  );
}

function OrderStatusSection({ orders }) {
  return (
    <React.Fragment>
      <StatusDisplayRow title="orders in progress:" />
      {orders.map(order => (
        <OrderRow
          orderName="Daniel F."
          productName="Cocunut Coconut Coconut"
          status={{ blending: true }}
        />
      ))}
    </React.Fragment>
  );
}

function PickupCell({ style, state }) {
  return (
    <View
      style={{
        backgroundColor: 'white',
        flex: 1,
        height: 80,
        ...style,
      }}
    />
  );
}

function PickupSection({ state }) {
  return (
    <React.Fragment>
      <StatusDisplayRow title="now serving:" />
      <View
        style={{
          overflow: 'hidden',
          backgroundColor: monsterra,
          flexDirection: 'row',
        }}
      >
        <PickupCell style={{ marginRight: 10 }} state={state.left} />
        <PickupCell state={state.right} />
      </View>
    </React.Fragment>
  );
}

function StatusDisplay({ state }) {
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <PresentationSection />
      <OrderStatusSection orders={state.orders} />
      <PickupSection state={state.pickup} />
    </View>
  );
}

function StatusDisplayDebug({ displayState, dispatch }) {
  return (
    <View
      style={{
        position: 'absolute',
        backgroundColor: 'blue',
        width: 200,
        height: 200,
      }}
    >
      <Button
        title="reduce"
        onPress={() =>
          dispatch({
            type: 'PlaceOrder',
            order: {},
          })
        }
      />
    </View>
  );
}

const reduceStatusDisplayState = `
console.log('onerun')
  if (!action) {
    return state;
  }
  if (action.type === 'PlaceOrder') {
    return {
      ...state,
      orders: [...(state.orders || []), action.order],
    };
  }
  return state;
`;

function StatusDisplayScreen() {
  const [displayState, dispatch] = useCloudReducer(
    'StatusDisplay',
    reduceStatusDisplayState,
    {
      orders: [],
      pickup: { left: null, right: null },
    },
  );

  if (!displayState) {
    return null;
  }
  return (
    <StatusDisplayLayout
      debugView={
        <StatusDisplayDebug displayState={displayState} dispatch={dispatch} />
      }
    >
      <StatusDisplay state={displayState} />
    </StatusDisplayLayout>
  );
}

const App = () => {
  return (
    <CloudContext.Provider value={OnoCloud}>
      <StatusDisplayScreen />
    </CloudContext.Provider>
  );
};

export default App;
