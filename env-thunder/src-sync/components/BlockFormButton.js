import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import Button from './Button';

export default function BlockFormButton({ buttonStyle, type, ...props }) {
  return (
    <Button
      {...props}
      type={type || 'solid'}
      buttonStyle={{
        flex: 1,
        marginHorizontal: 10,
        marginVertical: 0,
        ...buttonStyle,
      }}
    />
  );
}