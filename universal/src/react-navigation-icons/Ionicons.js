import React from 'react';
import { View } from 'react-native';

const Ionicons = ({ size, color }) => (
  <View
    style={{
      width: size,
      height: size,
      backgroundColor: color,
      borderRadius: size / 2,
    }}
  />
);

export default Ionicons;
