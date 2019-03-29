import React, { useContext, useState } from 'react';
import { View, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import Animated, { Easing } from 'react-native-reanimated';
import { useNavigation } from '../navigation-hooks/Hooks';
import NavigationContext from '../navigation-core/views/NavigationContext';

const PopoverContext = React.createContext(null);

export function PopoverTarget({ renderContent, renderPopover, timing }) {
  const ctx = useContext(PopoverContext);
  async function onPopover() {
    const location = await new Promise(resolve =>
      viewRef.current.measure((x, y, width, height, pageX, pageY) => {
        resolve({ x, y, width, height, pageX, pageY });
      }),
    );
    ctx.openPopover(renderPopover(), location, timing);
  }
  const viewRef = React.createRef();
  return <View ref={viewRef}>{renderContent(onPopover)}</View>;
}

export function useTargetPopover(renderPopover, timing) {
  const ctx = useContext(PopoverContext);
  const navigation = useNavigation();
  const targetRef = React.createRef();
  async function onPopover() {
    const location = await new Promise(resolve =>
      targetRef.current.measure((x, y, width, height, pageX, pageY) => {
        resolve({ x, y, width, height, pageX, pageY });
      }),
    );
    ctx.openPopover(renderPopover, location, timing, navigation);
  }
  return { targetRef, onPopover };
}

export function usePopover(renderPopover, timing) {
  const ctx = useContext(PopoverContext);
  const navigation = useNavigation();
  async function onPopover() {
    ctx.openPopover(renderPopover, null, timing, navigation);
  }
  return { onPopover };
}

const defaultTiming = {
  duration: 1000,
  easing: Easing.linear,
};

export function PopoverContainer({ children }) {
  let [configuredTiming, setConfiguredTiming] = useState(null);
  let [popoverOpenValue] = useState(new Animated.Value(0));
  let [popover, setPopover] = useState(null);
  let [containerLayout, setContainerLayout] = useState(null);
  function closePopover() {
    Animated.timing(popoverOpenValue, {
      toValue: new Animated.Value(0),
      ...(configuredTiming || defaultTiming),
    }).start(() => {
      setPopover(null);
    });
  }
  function openPopover(renderPopover, location, timing, navigation) {
    setConfiguredTiming(timing);
    setPopover(
      <NavigationContext.Provider value={navigation}>
        {renderPopover({
          onClose: closePopover,
          location,
          containerLayout,
          popoverOpenValue,
        })}
      </NavigationContext.Provider>,
    );
    Animated.timing(popoverOpenValue, {
      toValue: new Animated.Value(1),
      ...(timing || defaultTiming),
    }).start(() => {});
  }

  return (
    <View
      style={{ flex: 1 }}
      onLayout={e => {
        setContainerLayout(e.nativeEvent.layout);
      }}
    >
      <PopoverContext.Provider value={{ openPopover }}>
        {children}
      </PopoverContext.Provider>
      {popover && (
        <React.Fragment>
          <TouchableWithoutFeedback onPress={closePopover}>
            <Animated.View
              style={{
                backgroundColor: '#fff4',
                opacity: popoverOpenValue,
                ...StyleSheet.absoluteFillObject,
              }}
            />
          </TouchableWithoutFeedback>
          {popover}
        </React.Fragment>
      )}
    </View>
  );
}
