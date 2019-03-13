import React, { useContext, useState } from 'react';
import { View, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import Animated, { Easing } from 'react-native-reanimated';

const PopoverContext = React.createContext(null);

export function PopoverTarget({ renderContent, renderPopover }) {
  const ctx = useContext(PopoverContext);
  async function onPopover() {
    console.log('woah pop');
    const location = await new Promise(resolve =>
      viewRef.current.measure((x, y, width, height, pageX, pageY) => {
        console.log('hiho', location);
        resolve({ x, y, width, height, pageX, pageY });
      }),
    );
    ctx.openPopover(renderPopover(), location);
  }
  const viewRef = React.createRef();
  return <View ref={viewRef}>{renderContent(onPopover)}</View>;
}

export function useTargetPopover(renderPopover) {
  const ctx = useContext(PopoverContext);
  const targetRef = React.createRef();
  async function onPopover() {
    console.log('TARGETED pop');
    const location = await new Promise(resolve =>
      targetRef.current.measure((x, y, width, height, pageX, pageY) => {
        console.log('hiho', location);
        resolve({ x, y, width, height, pageX, pageY });
      }),
    );
    ctx.openPopover(renderPopover, location);
  }
  return { targetRef, onPopover };
}

export function PopoverContainer({ children }) {
  let [popoverOpenValue] = useState(new Animated.Value(0));
  let [popover, setPopover] = useState(null);
  let [containerLayout, setContainerLayout] = useState(null);
  function closePopover() {
    Animated.timing(popoverOpenValue, {
      toValue: 0,
      duration: 500,
      easing: Easing.linear,
    }).start(() => {
      setPopover(null);
    });
  }
  function openPopover(renderPopover, location) {
    setPopover(
      renderPopover({
        onClose: closePopover,
        location,
        containerLayout,
        popoverOpenValue,
      }),
    );
    Animated.timing(popoverOpenValue, {
      toValue: 1,
      duration: 500,
      easing: Easing.linear,
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
