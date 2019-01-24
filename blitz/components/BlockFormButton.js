import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import Button from '../../components/Button';

export default function BlockFormButton({ onPress, title }) {
  return (
    <Button
      onPress={onPress}
      title={title}
      style={{ flex: 1, marginHorizontal: 10, marginVertical: 0 }}
    />
  );
}
