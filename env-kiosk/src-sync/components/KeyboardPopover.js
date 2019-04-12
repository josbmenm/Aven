import React from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from 'react-native';
import { prettyShadow } from './Styles';

export default function KeyboardPopover({ children, onClose }) {
  return (
    <View
      style={{
        ...StyleSheet.absoluteFillObject,
        flex: 1,
        alignItems: 'center',
      }}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: '#0004',
          }}
        />
      </TouchableWithoutFeedback>
      <KeyboardAvoidingView behavior="padding" enabled>
        <View
          style={{
            flex: 1,
            width: 400,
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              alignSelf: 'stretch',
              ...prettyShadow,
              borderRadius: 10,
              width: 400,
              minHeight: 200,
            }}
          >
            {children}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
