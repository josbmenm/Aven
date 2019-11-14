import React from 'react';
import useKeyboardPopover from './useKeyboardPopover';
import Button from './Button';
import Tag from './Tag';
import { View, Text } from 'react-native';
import { primaryFontFace, boldPrimaryFontFace } from './Styles';

export default function useAsyncErrorPopover(onError) {
  const { onPopover } = useKeyboardPopover(({ onClose, openArguments }) => {
    return (
      <View
        style={{
          minHeight: 100,
          width: 320,
          padding: 30,
        }}
      >
        <Text
          style={{
            color: Tag.negativeColor,
            ...boldPrimaryFontFace,
            fontSize: 20,
          }}
        >
          {openArguments[0].name}
        </Text>
        <Text
          style={{
            color: Tag.neutralColor,
            ...primaryFontFace,
            marginBottom: 24,
            fontSize: 18,
          }}
        >
          {openArguments[0].message}
        </Text>
        <Button onPress={onClose} title="ok" />
      </View>
    );
  });
  function handler(promise) {
    return promise.catch(error => {
      const handled = onError && onError(error);
      if (!handled) {
        onPopover(error);
      }
    });
  }
  return handler;
}
