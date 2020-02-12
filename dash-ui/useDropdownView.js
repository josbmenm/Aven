import React from 'react';
import { Animated, Easing } from 'react-native';
import { useTargetPopover } from '../views/Popover';
import { prettyShadow } from '../components/Styles';

export default function useDropdownView(renderPopoverContent) {
  const { onPopover, targetRef } = useTargetPopover(
    ({ onClose, location, openValue }) => {
      return (
        <Animated.View
          style={{
            position: 'absolute',
            ...prettyShadow,
            left: location.pageX,
            top: location.pageY + location.height,
            width: location.width,
            transform: [
              {
                scaleY: openValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
              {
                translateY: openValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-120, 0],
                }),
              },
            ],
          }}
        >
          <Animated.View
            style={{
              opacity: openValue.interpolate({
                inputRange: [0.5, 1],
                outputRange: [0, 1],
              }),
              backgroundColor: 'white',
              minHeight: 100,
            }}
          >
            {renderPopoverContent({ onClose })}
          </Animated.View>
        </Animated.View>
      );
    },
    { easing: Easing.inOut(Easing.poly(5)), duration: 500 },
  );
  return { onPopover, targetRef };
}
