import React from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from 'react-native';
import { prettyShadow } from './Styles';
import Animated from 'react-native-reanimated';

export default function KeyboardPopover({ children, onClose, openValue }) {
  return (
    <View
      style={{
        ...StyleSheet.absoluteFillObject,
        flex: 1,
        alignItems: 'center',
      }}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: '#0004',
            opacity: openValue,
          }}
        />
      </TouchableWithoutFeedback>
      <KeyboardAvoidingView behavior="padding" enabled>
        <Animated.View
          style={{
            flex: 1,
            // width: 400,
            justifyContent: 'center',
            opacity: Animated.interpolate(openValue, {
              inputRange: [0, 0.5],
              outputRange: [0, 1],
            }),
            transform: [
              {
                translateY: Animated.interpolate(openValue, {
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
              },
            ],
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              alignSelf: 'stretch',
              ...prettyShadow,
              borderRadius: 10,
              // width: wide ? 636 : 400,
              minHeight: 200,
              padding: 8,
              minWidth: 300,
            }}
          >
            {children}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}
