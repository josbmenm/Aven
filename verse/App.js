import React, { useState, useEffect, useReducer } from 'react';
import { View, Text, Animated, Button, Image } from 'react-native';

import useCloud from '../cloud-core/useCloud';
import useObservable from '../cloud-core/useObservable';
import useCloudReducer from '../cloud-core/useCloudReducer';
import useCloudValue from '../cloud-core/useCloudValue';
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
      {debugView}
      <Animated.View
        style={{
          width: SCREEN_WIDTH,
          height: SCREEN_WIDTH * ASPECT_RATIO,
          transform: [{ translateX }, { translateY }, { scale }],
        }}
      >
        {children}
      </Animated.View>
    </View>
  );
}

function StatusDisplayTitleRow({ title }) {
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

function StatusDisplayRow({ title, subTitle, right }) {
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
      <View style={{ flex: 1 }}>
        <Text
          style={{
            ...boldPrimaryFontFace,
            fontSize: 28,
            paddingTop: 5,
            color: monsterra,
          }}
        >
          {title}
        </Text>
        <Text style={{ ...primaryFontFace, color: monsterra, fontSize: 16 }}>
          {subTitle}
        </Text>
      </View>
      {right}
    </View>
  );
}

function ETAText({ queuedIndex }) {
  return (
    <Text
      style={{
        ...primaryFontFace,
        color: monsterra,
        fontSize: 28,
        marginTop: 22,
      }}
    >
      {queuedIndex * 2} min
    </Text>
  );
}

function Cup({ isFilled }) {
  if (isFilled) {
    return (
      <Image
        source={require('./assets/cupFilled.png')}
        style={{ width: 48, height: 63 }}
      />
    );
  } else {
    return (
      <Image
        source={require('./assets/cupEmpty.png')}
        style={{ width: 48, height: 63 }}
      />
    );
  }
}

function OrderRow({ prepSpec, status, queuedIndex }) {
  let right = null;
  if (status === 'queued') {
    right = <ETAText queuedIndex={queuedIndex} />;
  }
  if (status === 'filling') {
    right = <Cup isFilled={false} />;
  }
  if (status === 'blending') {
    right = <Cup isFilled={true} />;
  }
  if (status === 'delivering') {
    right = <Cup isFilled={true} />;
  }
  return (
    <StatusDisplayRow
      title={prepSpec.displayName}
      subTitle={prepSpec.recipeName}
      right={right}
    />
  );
}

function PresentationSection() {
  return (
    <View style={{ height: 840, alignSelf: 'stretch' }}>
      <Image
        source={require('./assets/StatusStatic.png')}
        style={{ flex: 1 }}
      />
    </View>
  );
}

function QueueSection({ prepQueue, filling, blending, delivering }) {
  const renderQueue = [
    ...prepQueue.map((order, orderIndex) => (
      <OrderRow
        prepSpec={order}
        status={'queued'}
        queuedIndex={prepQueue.length - orderIndex}
      />
    )),
  ];
  filling && renderQueue.push(<OrderRow prepSpec={filling} status="filling" />);
  blending &&
    renderQueue.push(<OrderRow prepSpec={blending} status="blending" />);
  delivering &&
    renderQueue.push(<OrderRow prepSpec={delivering} status="delivering" />);
  return (
    <React.Fragment>
      <StatusDisplayTitleRow title="orders in progress:" />
      <View style={{ flex: 1 }}>{renderQueue}</View>
    </React.Fragment>
  );
}

function ReadyPickupCell({ state }) {
  return (
    <View
      style={{
        width: '50%',
        height: 192,
        flexDirection: 'row',
        padding: 30,
        paddingVertical: 50,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            ...boldPrimaryFontFace,
            fontSize: 28,
            paddingTop: 5,
            color: monsterra,
          }}
        >
          {state.displayName}
        </Text>
        <Text style={{ ...primaryFontFace, color: monsterra, fontSize: 16 }}>
          {state.recipeName}
        </Text>
      </View>
      <Cup isFilled={true} />
    </View>
  );
}

function PickupCell({ state }) {
  if (state) {
    return <ReadyPickupCell state={state} />;
  }
  return (
    <View
      style={{
        width: '50%',
        height: 192,
        flexDirection: 'row',
        padding: 30,
        paddingVertical: 50,
      }}
    />
  );
}

function PickupSection({ state }) {
  return (
    <React.Fragment>
      <StatusDisplayTitleRow title="now serving:" />
      <View
        style={{
          flexDirection: 'row',
          height: 192,
        }}
      >
        <PickupCell state={state.left} />
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
      <QueueSection {...state} />
      <PickupSection state={state.deliveryBays} />
    </View>
  );
}

function SubSystemSection({ subsystemName, subsystem, state }) {
  return <StatusDisplayRow title={`${subsystem.icon}  ${subsystemName}`} />;
}

function ConnectedDot() {
  const cloud = useCloud();
  const isConnected = useObservable(cloud.isConnected);
  return (
    <View
      style={{
        width: 50,
        height: 50,
        borderRadius: 25,
        position: 'absolute',
        backgroundColor: isConnected ? 'green' : 'red',
        top: 25,
        right: 50,
      }}
    />
  );
}
function KitchenDisplay({ kitchenState, config, restaurantState }) {
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <ConnectedDot />
      <StatusDisplayRow title="Kitchen Status" subTitle="closed" />
      <StatusDisplayRow title="Order Queue" subTitle="3 queued orders" />
      <StatusDisplayRow
        title="Fill System"
        subTitle="preparing Mango and Papaya"
      />
      <StatusDisplayRow subTitle={JSON.stringify(restaurantState)} />
      <StatusDisplayRow title="Blend System" subTitle="3 queued orders" />
      <StatusDisplayRow
        title="Delivery System A"
        subTitle="delivering Mango and Papaya for Daniel F"
      />
      <StatusDisplayRow title="Delivery System B" subTitle="ready" />
      <StatusDisplayTitleRow title="Kitchen Systems:" />
      {Object.keys(config.subsystems).map(subsystemName => (
        <SubSystemSection
          key={subsystemName}
          subsystemName={subsystemName}
          subsystem={config.subsystems[subsystemName]}
          state={kitchenState}
        />
      ))}
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
  const cloud = useCloud();
  return (
    <View
      style={{
        position: 'absolute',
        width: 200,
        height: 200,
      }}
    >
      <Button
        title={'Reset State'}
        onPress={() => {
          cloud.get('RestaurantState').put(initialRestaurantState);
        }}
      />
      <ActionButton
        type="PlaceOrder"
        getParams={() => ({
          order: {
            displayName: window.prompt('person name , last initial'),
            prepQueue: [
              {
                key: uuid(),
                recipeName: window.prompt('recipe name'),
              },
            ],
          },
        })}
        dispatch={dispatch}
      />
      <ActionButton
        type="KitchenPrepStart"
        getParams={() => {}}
        dispatch={dispatch}
      />
      <ActionButton
        type="KitchenBlend"
        getParams={() => {}}
        dispatch={dispatch}
      />
      <ActionButton
        type="KitchenCompleteBlend"
        getParams={() => {}}
        dispatch={dispatch}
      />
      <ActionButton
        type="KitchenDeliver"
        getParams={() => {
          return {
            bay: window.prompt('bay'),
          };
        }}
        dispatch={dispatch}
      />
      <ActionButton
        type="KitchenDeliveryClear"
        getParams={() => {
          return {
            bay: window.prompt('bay'),
          };
        }}
        dispatch={dispatch}
      />
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
  delivering: {...fill state}
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
  if (action.type === 'KitchenPrepStart') {

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

function reduceRestaurantState(state, action) {
  if (action.type === 'KitchenPrepStart') {
    if (state.filling) {
      throw new Error('Cannot start while already filling!');
    }
    return {
      ...state,
      prepQueue: state.prepQueue.slice(0, state.prepQueue.length - 1),
      filling: state.prepQueue[state.prepQueue.length - 1],
    };
  }
  if (action.type === 'KitchenFill') {
  }
  if (action.type === 'KitchenBlend') {
    if (state.blending) {
      throw new Error('cannot start blending while another meal is blending');
    }
    if (!state.filling) {
      return state;
    }
    return {
      ...state,
      filling: null,
      blending: state.filling,
    };
  }
  if (action.type === 'KitchenCompleteBlend') {
    if (state.delivering) {
      throw new Error(
        'cannot start delivering while another meal is delivering',
      );
    }
    if (!state.blending) {
      return state;
    }
    return {
      ...state,
      blending: null,
      delivering: state.blending,
    };
  }
  if (action.type === 'KitchenDeliver') {
    if (!state.delivering) {
      throw new Error('cannot deliver without a meal ready for delivery');
    }
    const { bay } = action;
    if (state.deliveryBays[bay] === undefined) {
      throw new Error(`cannot deliver unknown delivery bay "${bay}"`);
    }
    if (state.deliveryBays[bay]) {
      throw new Error(`cannot deliver to non-empty delivery bay "${bay}"`);
    }
    return {
      ...state,
      delivering: null,
      deliveryBays: {
        ...state.deliveryBays,
        [bay]: state.delivering,
      },
    };
  }
  if (action.type === 'KitchenDeliveryClear') {
    const { bay } = action;
    if (state.deliveryBays[bay] === undefined) {
      throw new Error(`cannot deliver unknown delivery bay "${bay}"`);
    }
    return {
      ...state,
      deliveryBays: {
        ...state.deliveryBays,
        [bay]: null,
      },
    };
  }
  if (action.type === 'PlaceOrder') {
    const prevPrepQueue = state.prepQueue;
    const { order } = action;
    if (!order || !order.prepQueue) {
      return state;
    }
    const newQueued = order.prepQueue.map(meal => ({
      ...meal,
      displayName: order.displayName,
    }));
    return {
      ...state,
      prepQueue: [...newQueued, ...prevPrepQueue],
    };
  }
  if (action.type === 'FillIngredient') {
    // action.ingredientName
    // action.ingredientIcon
    // action.ingredientColor
  }
  return state;
}
const initialRestaurantState = {
  prepQueue: [
    { displayName: 'Lucy V.', recipeName: 'Ginger and Greens', key: 'a' },
    { displayName: 'Stephen K.', recipeName: 'Mint Cocoa Protein', key: 'b' },
  ],
  filling: {
    displayName: 'Daniel F.',
    recipeName: 'Coconut Surprise',
    key: 'b',
  },
  blending: null,
  delivering: null,
  deliveryBays: { left: null, right: null },
};

function StatusDisplayScreen() {
  const cloud = useCloud();
  const restaurant = cloud.get('RestaurantState');
  const restaurantStateValue = useCloudValue(restaurant);
  const restaurantState =
    restaurantStateValue === null
      ? initialRestaurantState
      : restaurantStateValue;
  if (!restaurantState) {
    return null;
  }
  function dispatch(action) {
    const state = reduceRestaurantState(restaurantState, action);
    restaurant.put(state);
  }
  console.log('restaurantState', restaurantState);
  // return null;
  // const [displayState, dispatch] = React.useReducer(
  //   reduceRestaurantState,
  //   initialRestaurantState,
  // );

  // if (!displayState) {
  //   return null;
  // }
  // console.log('Display State: ', displayState);
  return (
    <StatusDisplayLayout
      debugView={
        <StatusDisplayDebug
          displayState={restaurantState}
          dispatch={dispatch}
        />
      }
    >
      <StatusDisplay state={restaurantState} />
    </StatusDisplayLayout>
  );
}

// function StatusDisplayScreen() {
//   const [displayState, dispatch] = useCloudReducer(
//     'StatusDisplay',
//     reduceStatusDisplayState,
//     {
//       prepQueue: [],
//       pickup: { left: null, right: null },
//     },
//   );

//   if (!displayState) {
//     return null;
//   }
//   return (
//     <StatusDisplayLayout
//       debugView={
//         <StatusDisplayDebug displayState={displayState} dispatch={dispatch} />
//       }
//     >
//       <StatusDisplay state={displayState} />
//     </StatusDisplayLayout>
//   );
// }

function Kitchen() {
  const kitchenConfig = useCloudValue('KitchenConfig');
  const kitchenState = useCloudValue('KitchenState');
  const restaurantState = useCloudValue('RestaurantState');

  if (!kitchenConfig) {
    return null;
  }
  return (
    <StatusDisplayLayout debugView={null}>
      <KitchenDisplay
        config={kitchenConfig}
        kitchenState={kitchenState}
        restaurantState={restaurantState}
      />
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
    Kitchen: StatusDisplayScreen,
    KitchenStatus: Kitchen,
  },
  {
    defaultNavigationOptions: {
      customCSS: fontsCSS,
    },
  },
);

function FullApp(props) {
  const cloud = useCloud();
  useEffect(() => {
    let hasConnectedOnce = cloud.isConnected.getValue();
    let wasConnected = hasConnectedOnce;

    const subs = cloud.isConnected.subscribe({
      next: isConnected => {
        if (isConnected && hasConnectedOnce && !wasConnected) {
          window.location.reload();
        }
        if (isConnected) {
          hasConnectedOnce = true;
        }
        wasConnected = isConnected;
      },
    });
    return () => subs.unsubscribe();
  }, [cloud]);
  return <App {...props} />;
}

FullApp.router = App.router;
FullApp.navigationOptions = App.navigationOptions;

export default FullApp;
