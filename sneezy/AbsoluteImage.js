import React from 'react';
import { Image, StyleSheet } from 'react-native';

function AbsoluteImage({ source, style }) {
  return (
    <Image
      source={source}
      style={StyleSheet.flatten([
        {
          position: 'absolute',
          zIndex: 10
        },
        style,
      ])}
    />
  );
}

export default AbsoluteImage
