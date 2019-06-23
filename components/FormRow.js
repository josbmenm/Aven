import React from 'react';
import { View } from 'react-native';

function FormRow({ children, direction = 'column' }) {
  return (
    <View style={{ marginBottom: 40, flexDirection: direction }}>{children}</View>
  );
}

export default FormRow;
