import React, { useState, useEffect, useReducer } from 'react';
import { View, Text, Animated, Button, Image } from 'react-native';

import { useCloudValue, useCloud } from '../cloud-core/KiteReact';

import Admin from '../admin/Admin';

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

function IngredientFillingCup({ fillLevel, currentFill }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {currentFill && (
        <Text>{currentFill.name || JSON.stringify(currentFill)}</Text>
      )}
      <AnimatedCup fillLevel={fillLevel} />
    </View>
  );
}

function TaskRow({ task, status, fill, queuedIndex }) {
  let right = null;
  if (status === 'queued') {
    right = <ETAText queuedIndex={queuedIndex} />;
  }
  if (status === 'filling' && fill) {
    let fillLevel = 0;
    let currentFill = null;
    if (fill.fillsCompleted && fill.fillsRemaining) {
      const remaining = fill.fillsRemaining.length;
      const completed = fill.fillsCompleted.length;
      fillLevel = completed / (completed + remaining);
      if (fill.fillsRemaining[0]) {
        currentFill = fill.fillsRemaining[0];
      }
    }
    right = (
      <IngredientFillingCup currentFill={currentFill} fillLevel={fillLevel} />
    );
  }
  if (status === 'blending') {
    right = <AnimatedCup fillLevel={1} />;
  }
  if (status === 'delivering') {
    right = <AnimatedCup fillLevel={1} />;
  }
  return (
    <StatusDisplayRow
      title={task.name}
      subTitle={task.blendName}
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

function QueueSection({ queue = [], fill, blend, delivery }) {
  const renderQueue = [
    ...queue.map((task, taskIndex) => (
      <TaskRow
        key={task.id}
        task={task}
        status={'queued'}
        queuedIndex={queue.length - taskIndex}
      />
    )),
  ];
  fill &&
    renderQueue.push(
      <TaskRow
        key={fill.task.id}
        task={fill.task}
        fill={fill}
        status="filling"
      />,
    );
  blend &&
    renderQueue.push(
      <TaskRow
        key={blend.task && blend.task.id}
        task={blend.task}
        status="blending"
      />,
    );
  delivery &&
    renderQueue.push(
      <TaskRow
        key={delivery.task.id}
        task={delivery.task}
        status="delivering"
      />,
    );
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
          {state.task.name}
        </Text>
        <Text style={{ ...primaryFontFace, color: monsterra, fontSize: 16 }}>
          {state.task.blendName}
        </Text>
      </View>
      <AnimatedCup fillLevel={1} />
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

function PickupSection({ deliveryA, deliveryB }) {
  return (
    <React.Fragment>
      <StatusDisplayTitleRow title="now serving:" />
      <View
        style={{
          flexDirection: 'row',
          height: 192,
        }}
      >
        <PickupCell state={deliveryA} />
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
        <PickupCell state={deliveryB} />
      </View>
    </React.Fragment>
  );
}

const ANIM_INC = 0.01;

function AnimatedCup({ fillLevel }) {
  let [shownFillLevel, setShownFillLevel] = React.useState(fillLevel);
  let zz = React.useRef({ animationFrame: null, ff: fillLevel });
  React.useEffect(() => {
    window.cancelAnimationFrame(zz.current.animationFrame);
    function performUpdate() {
      let n = null;
      let lastFillLevel = zz.current.ff;
      if (fillLevel > lastFillLevel) {
        n = Math.min(fillLevel, lastFillLevel + ANIM_INC);
      } else if (fillLevel < lastFillLevel) {
        n = Math.max(fillLevel, lastFillLevel - ANIM_INC);
      }
      if (n === null) {
        return;
      }
      zz.current.ff = n;
      setShownFillLevel(n);
      zz.current.animationFrame = window.requestAnimationFrame(performUpdate);
    }
    zz.current.animationFrame = window.requestAnimationFrame(performUpdate);
  }, [fillLevel]);
  return (
    <View style={{ width: 49, height: 64 }}>
      <div
        style={{
          width: 49,
          height: 64,
          position: 'absolute',
          left: 0,
          top: 0,
          WebkitMaskImage: `url(${require('./assets/CupFill.svg')})`,
          WebkitMaskPosition: `center -${100 -
            Math.floor(shownFillLevel * 100) +
            2}%`,
          WebkitMaskRepeat: 'no-repeat',
          maskMode: 'alpha',
        }}
      >
        <Image
          source={require('./assets/CupFill.svg')}
          style={{
            width: 49,
            height: 64,
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
      </div>
      <Image
        source={require('./assets/CupOutline.svg')}
        style={{ width: 49, height: 64, position: 'absolute', top: 0, left: 0 }}
      />
    </View>
  );
}

function StatusDisplay({ state }) {
  // const [fillLevel, setFillLevel] = React.useState(0);
  // React.useEffect(() => {
  //   setInterval(() => {
  //     setFillLevel(Math.random());
  //   }, 5000);
  // }, []);
  // return <AnimatedCup fillLevel={fillLevel} />;
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <PresentationSection />
      <QueueSection {...state} />
      <PickupSection {...state} />
    </View>
  );
}

function SubSystemSection({ subsystemName, subsystem, state }) {
  return <StatusDisplayRow title={`${subsystem.icon}  ${subsystemName}`} />;
}

function ConnectedDot() {
  return null;
  // return (
  //   <View
  //     style={{
  //       width: 50,
  //       height: 50,
  //       borderRadius: 25,
  //       position: 'absolute',
  //       backgroundColor: isConnected ? 'green' : 'red',
  //       top: 25,
  //       right: 50,
  //     }}
  //   />
  // );
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
          ...(getParams && getParams()),
        })
      }
    />
  );
}

function StatusDisplayScreen() {
  const restaurantState = useCloudValue('RestaurantState');

  if (!restaurantState) {
    return null;
  }
  return (
    <StatusDisplayLayout>
      <StatusDisplay state={restaurantState} />
    </StatusDisplayLayout>
  );
}

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
    let hasConnectedOnce = cloud.connected.get();
    let wasConnected = hasConnectedOnce;
    const listener = {
      next: isConnected => {
        if (isConnected && hasConnectedOnce && !wasConnected) {
          window.location.reload();
        }
        if (isConnected) {
          hasConnectedOnce = true;
        }
        wasConnected = isConnected;
      },
    };
    cloud.connected.stream.addListener(listener);
    return () => cloud.connected.stream.removeListener(listener);
  }, [cloud]);
  return <App {...props} />;
}

FullApp.router = App.router;
FullApp.navigationOptions = App.navigationOptions;

export default FullApp;
