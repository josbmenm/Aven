import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Text, Spacing, Large } from '../dash-ui';

export default function TextButton({ onPress, title, onLongPress }) {
  return (
    <TouchableOpacity onPress={onPress} onLongPress={onLongPress}>
      <Spacing value={16}>
        <Large>
          <Text bold>{title}</Text>
        </Large>
      </Spacing>
    </TouchableOpacity>
  );
}
