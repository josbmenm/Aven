import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Text, Spacing, Large, useTheme } from '../dash-ui';

export default function TextButton({ onPress, title, onLongPress }) {
  const { colorPrimary } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} onLongPress={onLongPress}>
      <Spacing value={16}>
        <Large>
          <Text
            bold
            theme={{
              colorForeground: colorPrimary,
            }}
          >
            {title}
          </Text>
        </Large>
      </Spacing>
    </TouchableOpacity>
  );
}
