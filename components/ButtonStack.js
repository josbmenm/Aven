import React from 'react';
import { View } from 'react-native';

export default function ButtonStack({ buttons, style }) {
  return (
    <View style={style}>
      {buttons.map((button, buttonIndex) => (
        <View
          style={{ marginBottom: buttonIndex === buttons.length - 1 ? 0 : 12 }}
        >
          {button}
        </View>
      ))}
    </View>
  );
}
