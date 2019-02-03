import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import Button from '../../components/Button';

export default function BlockFormButton({ onPress, title, disabled }) {
  return (
    <Button
      onPress={onPress}
      title={title}
      disabled={disabled}
      style={{ flex: 1, marginHorizontal: 10, marginVertical: 0 }}
    />
  );
}
