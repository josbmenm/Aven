import React, { useContext, useState } from 'react';
import { View, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { useNavigation } from '../navigation-hooks/Hooks';
import NavigationContext from '../navigation-core/views/NavigationContext';
import Animated, { Easing } from 'react-native-reanimated';

import {
  PopoverTarget as Target,
  usePopover as use,
  useTargetPopover as useTarget,
  PopoverContext as Context,
} from './PopoverCommon';

export const PopoverTarget = Target;
export const usePopover = use;
export const useTargetPopover = useTarget;
export const PopoverContext = Context;

const defaultTiming = {
  duration: 1000,
  easing: Easing.linear,
};

export function PopoverContainer({ children }) {
  let [configuredTiming, setConfiguredTiming] = useState(null);
  let [openValue] = useState(new Animated.Value(0));
  let [popover, setPopover] = useState(null);
  let [containerLayout, setContainerLayout] = useState(null);
  function closePopover() {
    Animated.timing(openValue, {
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
          openValue,
        })}
      </NavigationContext.Provider>,
    );
    Animated.timing(openValue, {
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
