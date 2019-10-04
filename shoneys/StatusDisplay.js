import React, { useState } from 'react';
import { View, Text, Animated, Image, StyleSheet, Easing } from 'react-native';

import { useCloudValue } from '../cloud-core/KiteReact';

import {
  monsterra,
  monsterraLight,
  boldPrimaryFontFace,
  primaryFontFace,
  black10,
  titleStyle,
} from '../components/Styles';
import AirtableImage from '../components/AirtableImage';
import useTimeSeconds from '../utils/useTimeSeconds';
import { useIsRestaurantOpen } from '../ono-cloud/Kitchen';
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

function StatusDisplayRow({ title, subTitle, right, isFadingAway }) {
  const [fadeAwayProgress] = React.useState(new Animated.Value(0));
  React.useEffect(() => {
    Animated.timing(fadeAwayProgress, {
      toValue: Number(isFadingAway || 0),
      duration: 500,
      easing: Easing.poly(5),
    }).start();
  }, [isFadingAway]);
  return (
    <Animated.View
      style={{
        flexDirection: 'row',
        paddingHorizontal: 60,
        paddingTop: 17,
        paddingBottom: 19,
        borderBottomWidth: 1,
        borderBottomColor: black10,
        opacity: fadeAwayProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0],
        }),
        transform: [
          {
            translateY: fadeAwayProgress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 50],
            }),
          },
        ],
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
    </Animated.View>
  );
}

function BlendOverlay({ isBlending }) {
  const [spinPosition] = React.useState(new Animated.Value(0));
  const [opacity] = React.useState(new Animated.Value(0));
  React.useEffect(() => {
    Animated.timing(opacity, {
      toValue: isBlending ? 1 : 0,
      duration: 500,
      easing: Easing.inOut(Easing.quad),
    }).start();
  }, [isBlending]);
  React.useEffect(() => {
    Animated.timing(spinPosition, {
      toValue: 1,
      duration: 18000000,
      easing: Easing.linear,
    }).start(() => {});
  }, []);
  return (
    <Animated.Image
      style={{
        opacity,
        width: 30,
        height: 30,
        left: 9,
        top: 16,
        transform: [
          {
            rotateX: '70deg',
          },
          {
            rotateZ: spinPosition.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '3600000deg'],
            }),
          },
        ],
      }}
      source={require('./assets/Spinner.png')}
    />
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
      {queuedIndex + 2} min
    </Text>
  );
}

function IngredientFillingCup({
  fillLevel,
  currentFill,
  blendTintColor,
  isBlending,
}) {
  const [ingredientMessageOpacity] = React.useState(new Animated.Value(0));
  const [toDotValue] = React.useState(new Animated.Value(0));
  const [moveToCup] = React.useState(new Animated.Value(0));
  const [moveDownInCup] = React.useState(new Animated.Value(0));
  const [dotOpacity] = React.useState(new Animated.Value(0));
  const [shownFillLevel, setShownFillLevel] = React.useState(0);
  const currentIngredient = currentFill && currentFill.ingredientId;
  React.useEffect(() => {
    toDotValue.setValue(0);
    moveToCup.setValue(0);
    moveDownInCup.setValue(0);
    dotOpacity.setValue(0);

    const baseDelay = 4000;

    Animated.timing(ingredientMessageOpacity, {
      toValue: 1,
      duration: 500,
      easing: Easing.inOut(Easing.poly(5)),
    }).start();
    setTimeout(() => {
      Animated.timing(ingredientMessageOpacity, {
        toValue: 0,
        duration: 500,
        easing: Easing.inOut(Easing.poly(5)),
      }).start();
    }, baseDelay + 2000);

    setTimeout(() => {
      setShownFillLevel(fillLevel);
    }, baseDelay + 2500);

    setTimeout(() => {
      setTimeout(() => {
        Animated.timing(dotOpacity, {
          toValue: 1,
          duration: 250,
          easing: Easing.inOut(Easing.poly(5)),
        }).start();
      }, 250);
      Animated.timing(toDotValue, {
        toValue: 1,
        duration: 700,
        easing: Easing.inOut(Easing.poly(5)),
      }).start(() => {
        Animated.timing(moveToCup, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.poly(5)),
        }).start(() => {
          Animated.timing(moveDownInCup, {
            toValue: 1,
            duration: 700,
            easing: Easing.inOut(Easing.poly(5)),
          }).start(() => {
            Animated.timing(dotOpacity, {
              toValue: 0,
              duration: 400,
              easing: Easing.inOut(Easing.poly(5)),
            }).start(() => {});
          });
        });
      });
    }, baseDelay);
  }, [currentIngredient, fillLevel]);
  return (
    <View style={{ flexDirection: 'row' }}>
      {currentFill && (
        <View style={{ flexDirection: 'row' }}>
          {currentFill.ingredientName && (
            <Animated.Text
              style={{
                ...primaryFontFace,
                color: monsterra,
                fontSize: 32,
                marginTop: 10,
                marginRight: 110,
                opacity: ingredientMessageOpacity,
              }}
            >
              adding {currentFill.ingredientName.toLowerCase()}..
            </Animated.Text>
          )}
          <Animated.View
            style={{
              position: 'absolute',
              right: 20,
              top: -5,
              height: 80,
              width: 80,
              borderRadius: 40,
              backgroundColor: currentFill.ingredientColor,
              opacity: dotOpacity,
              transform: [
                {
                  translateY: moveDownInCup.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 15],
                  }),
                },
                {
                  translateX: moveToCup.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 83.5],
                  }),
                },
                {
                  scale: toDotValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 0.16],
                  }),
                },
              ],
            }}
          />
          <Animated.View
            style={{
              position: 'absolute',
              right: 20,
              opacity: toDotValue.interpolate({
                inputRange: [0.8, 1],
                outputRange: [0, -1],
              }),
              transform: [
                {
                  scale: toDotValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.3],
                  }),
                },
                { scale: 0.8 },
              ],
            }}
          >
            <Animated.View style={{ opacity: ingredientMessageOpacity }}>
              <AirtableImage
                style={{ width: 75, height: 75 }}
                tintColor={currentFill.ingredientColor}
                image={currentFill.ingredientIcon}
              />
            </Animated.View>
          </Animated.View>
        </View>
      )}
      <AnimatedCup
        fillLevel={shownFillLevel}
        blendTintColor={blendTintColor}
        isBlending={isBlending}
      />
    </View>
  );
}

function TaskRow({ task, status, fill, queuedIndex, isFadingAway }) {
  if (!task) {
    return null;
  }
  let right = null;
  if (status === 'queued') {
    right = <ETAText queuedIndex={queuedIndex} />;
  }
  if (status === 'filling' && fill) {
    let fillLevel = 0;
    let currentFill = null;
    const remainingCount = fill.fillsRemaining ? fill.fillsRemaining.length : 0;
    const completedCount = fill.fillsCompleted ? fill.fillsCompleted.length : 0;
    fillLevel = completedCount / (completedCount + remainingCount + 1);
    fillLevel += 0.25;
    if (fill.fillsRemaining && fill.fillsRemaining[0]) {
      currentFill = fill.fillsRemaining[0];
    }
    right = (
      <IngredientFillingCup
        currentFill={currentFill}
        fillLevel={fillLevel}
        blendTintColor={task.blendColor}
      />
    );
  }
  if (status === 'blending') {
    right = (
      <AnimatedCup
        fillLevel={1}
        blendTintColor={task.blendColor}
        isBlending={true}
      />
    );
  }
  if (status === 'delivering') {
    right = <AnimatedCup fillLevel={1} blendTintColor={task.blendColor} />;
  }
  return (
    <StatusDisplayRow
      isFadingAway={isFadingAway}
      title={task.name}
      subTitle={task.blendName}
      right={right}
    />
  );
}

function BackgroundView({ image, children, style }) {
  return (
    <View
      style={{
        flex: 1,
        ...style,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Image
        style={{ ...StyleSheet.absoluteFillObject }}
        source={image}
        resizeMode="contain"
      />
      {children}
    </View>
  );
}

function PresoBackground({ children, style }) {
  return (
    <BackgroundView style={style} image={require('./assets/BackgroundTop.png')}>
      {children}
    </BackgroundView>
  );
}
function FullScreenBackground({ children, style }) {
  return (
    <BackgroundView
      style={style}
      image={require('./assets/BackgroundFull.png')}
    >
      {children}
    </BackgroundView>
  );
}

function PresentationSection({ closingSoon }) {
  let content = (
    <Image source={require('./assets/StatusStatic.png')} style={{ flex: 1 }} />
  );
  const scheduledClose = closingSoon && closingSoon.scheduledCloseTime;
  const timeSeconds = useTimeSeconds();
  if (scheduledClose) {
    const minsRemaining = Math.round(
      (closingSoon.scheduledCloseTime / 1000 - timeSeconds) / 60,
    );
    if (minsRemaining < 2) {
      content = (
        <PresoBackground>
          <StoreSign title="last call!" subtitle={`closing in a minute`} />
        </PresoBackground>
      );
    } else {
      content = (
        <PresoBackground>
          <StoreSign
            title="last call!"
            subtitle={`closing in ${minsRemaining} minutes`}
          />
        </PresoBackground>
      );
    }
  }
  return <View style={{ height: 840, alignSelf: 'stretch' }}>{content}</View>;
}

function QueueSection({ queue = [], fill, blend, delivery }) {
  const renderQueue = [
    ...queue.map(
      (task, taskIndex) =>
        task && (
          <TaskRow
            key={task.id}
            task={task}
            status={'queued'}
            queuedIndex={taskIndex}
          />
        ),
    ),
  ].reverse();
  fill &&
    fill.task &&
    renderQueue.push(
      <TaskRow
        key={fill.task.id}
        task={fill.task}
        fill={fill}
        status="filling"
      />,
    );
  blend &&
    blend.task &&
    renderQueue.push(
      <TaskRow
        key={blend.task && blend.task.id}
        task={blend.task}
        status="blending"
      />,
    );
  delivery &&
    delivery.task &&
    renderQueue.push(
      <TaskRow
        key={delivery.task.id}
        task={delivery.task}
        status="delivering"
        isFadingAway={!!delivery.willDeliverTo}
      />,
    );
  return (
    <React.Fragment>
      <StatusDisplayTitleRow title="orders in progress:" />
      <View style={{ flex: 1 }}>{renderQueue}</View>
    </React.Fragment>
  );
}

function PickupCellContent({ state }) {
  if (!state) {
    return null;
  }
  const name = state.task ? state.task.name : 'Unknown';
  const blendName = state.task ? state.task.blendName : 'please discard cup';
  return (
    <View
      style={{
        flex: 1,
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
          {name}
        </Text>
        <Text style={{ ...primaryFontFace, color: monsterra, fontSize: 16 }}>
          {blendName}
        </Text>
      </View>
      <AnimatedCup
        fillLevel={1}
        blendTintColor={state.task && state.task.blendColor}
      />
    </View>
  );
}

function PickupCell({ state }) {
  const [openProgress] = React.useState(new Animated.Value(0));
  React.useEffect(() => {
    Animated.timing(openProgress, {
      toValue: Number(!!state),
      duration: 1000,
      timing: Easing.linear,
    }).start();
  }, [!!state]);
  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: openProgress,
      }}
    >
      <PickupCellContent state={state} />
    </Animated.View>
  );
}

function PickupSection({ delivery0, delivery1, delivery }) {
  let state0 =
    delivery && delivery.willDeliverTo === 'delivery0' ? delivery : delivery0;
  let state1 =
    delivery && delivery.willDeliverTo === 'delivery1' ? delivery : delivery1;
  return (
    <View style={{ backgroundColor: 'white' }}>
      <StatusDisplayTitleRow title="now serving:" />
      <View
        style={{
          flexDirection: 'row',
          height: 192,
        }}
      >
        <PickupCell state={state0} />
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
        <PickupCell state={state1} />
      </View>
    </View>
  );
}

const ANIM_INC = 0.01;

function AnimatedCup({ fillLevel, blendTintColor, isBlending }) {
  let [shownFillLevel, setShownFillLevel] = React.useState(fillLevel);
  let zz = React.useRef({ timeout: null, ff: fillLevel });
  React.useEffect(() => {
    clearTimeout(zz.current.timeout);
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
      zz.current.timeout = setTimeout(performUpdate, 30);
    }
    zz.current.timeout = setTimeout(performUpdate, 30);
    return () => {
      clearTimeout(zz.current.timeout);
    };
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
            tintColor: blendTintColor,
            left: 0,
          }}
        />
      </div>
      <BlendOverlay isBlending={isBlending} />
      <Image
        source={require('./assets/CupOutline.svg')}
        style={{ width: 49, height: 64, position: 'absolute', top: 0, left: 0 }}
      />
    </View>
  );
}

function StoreSign({ title, subtitle }) {
  return (
    <BackgroundView
      image={require('./assets/StoreSign.png')}
      style={{
        height: 470,
        width: 593,
        transform: [{ rotate: '10deg' }, { translateY: -70 }],
      }}
    >
      <View
        style={{
          flex: 1,
          marginTop: 180,
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            ...titleStyle,
            textAlign: 'center',
            fontSize: 52,
            marginVertical: 12,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            ...titleStyle,
            textAlign: 'center',
            fontSize: 42,
            marginVertical: 16,
          }}
        >
          {subtitle}
        </Text>
      </View>
    </BackgroundView>
  );
}

function StatusDisplay({ state }) {
  const { isOpen, closingSoon, isTraveling } = useIsRestaurantOpen(state);
  if (isTraveling) {
    return <View style={{ flex: 1, backgroundColor: 'black' }} />;
  }
  if (!isOpen) {
    return (
      <FullScreenBackground>
        <StoreSign title="closed" subtitle="find us again soon!" />
      </FullScreenBackground>
    );
  }
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <PresentationSection closingSoon={closingSoon} />
      <QueueSection {...state} />
      <PickupSection {...state} />
    </View>
  );
}

export default function StatusDisplayScreen() {
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
