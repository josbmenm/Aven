import React, { useState, useReducer } from 'react';
import { View, Text, Animated, Button } from 'react-native';

import useCloudState from '../aven-cloud/useCloudState';
import useCloudReducer from '../aven-cloud/useCloudReducer';
import useCloudValue from '../aven-cloud/useCloudValue';
import uuid from 'uuid/v1';

import Admin from '../aven-admin/Admin';

import { createSwitchNavigator } from '../navigation-core';
import {
  monsterra,
  monsterraLight,
  boldPrimaryFontFace,
  primaryFontFace,
  black10,
} from '../components/Styles';

let baseAuthority = undefined;
let baseUseSSL = undefined;
if (global.window) {
  baseAuthority = window.location.host;
  baseUseSSL = window.location.protocol !== 'http:';
}

function AdminScreen({ navigation }) {
  return (
    <Admin
      navigation={navigation}
      defaultSession={{
        useSSL: baseUseSSL,
        authority: baseAuthority,
        domain: 'onofood.co',
      }}
    />
  );
}

AdminScreen.router = Admin.router;

const SCREEN_WIDTH = 1080;
const ASPECT_RATIO = 16 / 9;

function StatusDisplayLayout({ children, backgroundColor, debugView }) {
  const [scale] = useState(new Animated.Value(1));
  const [translateY] = useState(new Animated.Value(0));
  const [translateX] = useState(new Animated.Value(0));
  return (
    <View
      style={{ flex: 1, backgroundColor: '#eee', overflow: 'hidden' }}
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
      style={{
        backgroundColor: monsterraLight,
        height: 95,
        paddingHorizontal: 60,
        paddingTop: 20,
      }}
    >
      <Text style={{ fontSize: 36, color: 'white', ...boldPrimaryFontFace }}>
        {title}
      </Text>
    </View>
  );
}

function OrderRow({ orderName, status, productName }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        paddingHorizontal: 60,
        paddingVertical: 17,
        borderBottomWidth: 1,
        borderBottomColor: black10,
      }}
    >
      <View>
        <Text
          style={{
            ...boldPrimaryFontFace,
            fontSize: 28,
            paddingTop: 5,
            color: monsterra,
          }}
        >
          {orderName}
        </Text>
        <Text style={{ ...primaryFontFace, color: monsterra, fontSize: 16 }}>
          {productName}
        </Text>
      </View>
      {status}
    </View>
  );
}

function PresentationSection() {
  return <View style={{ flex: 1, alignSelf: 'stretch' }} />;
}

function QueueSection({ prepQueue }) {
  return (
    <React.Fragment>
      <StatusDisplayRow title="orders in progress:" />
      {prepQueue.map(order => (
        <OrderRow
          orderName={order.displayName}
          productName={order.recipeName}
          status={order.inProgress ? null : null}
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
          flexDirection: 'row',
          height: 192,
        }}
      >
        <PickupCell style={{}} state={state.left} />
        <View style={{ padding: 28 }}>
          <View
            style={{
              backgroundColor: monsterraLight,
              flex: 1,
              width: 8,
              borderRadius: 4,
            }}
          />
        </View>
        <PickupCell state={state.right} />
      </View>
    </React.Fragment>
  );
}

function StatusDisplay({ state }) {
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <PresentationSection />
      <QueueSection prepQueue={state.prepQueue} />
      <PickupSection state={state.pickup} />
    </View>
  );
}

function KitchenDisplay({ state, config }) {
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusDisplayRow title="Restaurant State:" />
      <Text>{JSON.stringify(state)}</Text>
      <StatusDisplayRow title="Kitchen Systems:" />
      <Text>{JSON.stringify(config.subsystems)}</Text>
    </View>
  );
}

function ActionButton({ dispatch, name, type, getParams }) {
  return (
    <Button
      title={name || type}
      onPress={() =>
        dispatch({
          type,
          ...getParams(),
        })
      }
    />
  );
}
function StatusDisplayDebug({ displayState, dispatch }) {
  return (
    <View
      style={{
        position: 'absolute',
        width: 200,
        height: 200,
      }}
    >
      <ActionButton
        type="PlaceOrder"
        getParams={() => ({
          order: {
            displayName: 'Daniel F',
            prepQueue: [
              {
                key: uuid(),
                recipeName: 'Cocunut suprise',
              },
            ],
          },
        })}
        dispatch={dispatch}
      />
      <ActionButton
        type="Pickup"
        name="Pickup 0"
        params={{ bay: 0 }}
        dispatch={dispatch}
      />
      <ActionButton
        type="Pickup"
        name="Pickup 1"
        params={{ bay: 1 }}
        dispatch={dispatch}
      />
      <ActionButton type="BlendOrder" params={{}} dispatch={dispatch} />
    </View>
  );
}

/*

machine fault, machine alarm: {
  time: 456789, // when was this reported
  faultName/alarmName: // text from airtable about what is up

}

machine debug: {
  alarms: [{...machine alarm}]
  faults: [{...machine fault}]
}

fill spec: {
  systemId: 1, // refers to Airtable "KitchenSystems" "FillSystemID"
  slotNumber: 1, // refers to Airtable "KitchenIngredients" "Slot Number"
  amount: 123, // quantity to command to the PLC
}

prep spec: {
  orderName: 'Daniel F',
  menuItemName: 'Mango & Papaya',
  menuItemColor: '#123456',
  requestedFills: [
    {...fill spec}
  ]
}

fill result: {
  ...fill spec
  startTime: 456789, // 
  completeTime: 456789, //
}

fill state: {
  ... prep spec,
  prepStartTime: 56789, // timestamp of when the cup started
  cupLandTime: 56789, // timestamp of when the cup was recieved for filling
  currentFill: {...fill result}, // the fill that is currently happening. null if not filling
  queuedFills: [{...fill spec}],
  completedFills: [{...fill result}],
}

blend state: {
  ... prep spec,
  prepStartTime: 56789, // timestamp of when the cup started
  cupLandTime: 56789, // timestamp of when the cup was recieved for filling
  fillCompleteTime: 56789,
  blendStartTime: 56789,
  blendCompleteTime: 56789,
  deliverTime: 56789,
  completedFills: [{...fill result}],
}

delivery state: {
  ... blend state
}

restaurant state: {
  prepQueue: [
    {...prep spec}
    // bottom of list is "next up"
  ],
  filling: {...fill state},
  blending: {...fill state},
  deliveryBays: {
    A: {...delivery state},
    B: {...delivery state}
  },
  status: (
    || "open" - currently working or ready
    || "closed" - turned off or something
    || "faulted" - kitchen is faulted.
    // maybe also "loading" "unloading" "filling" "travel" "debug"
  ),
  faultSystem: "", // "filling", "blending", "delivery"
  faultDeliverySystem: "", // name of faulted delivery bay. null when delivery bay not faulted.
  dispenserState: [// indexed by system id
    [// indexed by slot id
      {ingredientId, estimatedLevel, lastFillTime, lastFillLevel}
    ]
  ]
}

*/

const reduceStatusDisplayState = `
console.log('onerun')
  if (!action) {
    return state;
  }
  if (action.type === 'KitchenCupStart') {

  }
  if (action.type === 'KitchenFill') {

  }
  if (action.type === 'KitchenBlend') {

  }
  if (action.type === 'KitchenDeliver') {
    return {

    }
  }
  if (action.type === 'PlaceOrder') {
    const prevPrepQueue = state && state.prepQueue || [];
    const { order } = action;
    if (!order || !order.prepQueue) {
      return state;
    }
    const newQueued = order.prepQueue.map(meal => ({
      ...meal,
      displayName: order.displayName
    }));
    return {
      ...state,
      prepQueue: [...prevPrepQueue, ...newQueued],
    };
  }
  if (action.type === 'FillIngredient') {
    
    action.ingredientName
    action.ingredientIcon
    action.ingredientColor
  }
  return state;
`;

function StatusDisplayScreen() {
  const [displayState, dispatch] = useCloudReducer(
    'StatusDisplay',
    reduceStatusDisplayState,
    {
      prepQueue: [],
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

function Kitchen() {
  const kitchenConfig = useCloudValue('KitchenConfig');
  const kitchenState = useCloudValue('KitchenState');

  if (!kitchenConfig) {
    return null;
  }
  return (
    <StatusDisplayLayout debugView={null}>
      <KitchenDisplay config={kitchenConfig} state={kitchenState} />
    </StatusDisplayLayout>
  );
}
const fontsCSS = `
@font-face {
  src: url('/fonts/Maax-Bold.ttf');
  font-family: Maax-Bold;
}
@font-face {
  src: url('/fonts/Maax.ttf');
  font-family: Maax;
}
@font-face {
  src: url('/fonts/Lora.ttf');
  font-family: Lora;
}
`;

const App = createSwitchNavigator(
  {
    Admin: {
      screen: AdminScreen,
      navigationOptions: { title: 'Maui Status' },
    },
    StatusDisplay: StatusDisplayScreen,
    Kitchen,
  },
  {
    defaultNavigationOptions: {
      customCSS: fontsCSS,
    },
  },
);

export default App;
