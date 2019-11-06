import React, { useContext, useState, useRef } from 'react';
import {
  View,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
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
  async function onPopover(...args) {
    ctx.openPopover(renderPopover, null, timing, navigation, args);
  }
  return { onPopover };
}

const defaultTiming = {
  duration: 3000,
  easing: Easing.linear,
};

export function PopoverContainer({ children }) {
  let timingConfig = useRef(defaultTiming);
  let [openValue] = useState(new Animated.Value(0));
  let [popover, setPopover] = useState(null);
  let [containerLayout, setContainerLayout] = useState(null);
  function closePopover() {
    Animated.timing(openValue, {
      toValue: 0,
      ...(timingConfig.current || defaultTiming),
    }).start(() => {
      setPopover(null);
    });
  }
  function openPopover(renderPopover, location, timing, navigation, args) {
    timingConfig.current = timing;
    setPopover(
      <NavigationContext.Provider value={navigation}>
        {renderPopover({
          onClose: closePopover,
          location,
          containerLayout,
          openValue,
          openArguments: args,
        })}
      </NavigationContext.Provider>,
    );
    Animated.timing(openValue, {
      toValue: 1,
      ...(timingConfig.current || defaultTiming),
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
                opacity: openValue,
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
