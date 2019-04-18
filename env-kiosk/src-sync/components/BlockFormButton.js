import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import Button from './Button';

export default function BlockFormButton({
  onPress,
  title,
  disabled,
  secondary,
}) {
  return (
    <Button
      onPress={onPress}
      secondary={secondary}
      title={title}
      disabled={disabled}
      style={{ flex: 1, marginHorizontal: 10, marginVertical: 0 }}
    />
  );
}
