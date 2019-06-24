import React from 'react';
import { View } from 'react-native';
import { Responsive } from './Responsive';

function FormRow({ children, style, direction = 'column', ...rest }) {
  return (
    <Responsive
      style={{
        flexDirection: ['column', direction],
      }}
    >
      <View style={[{ marginBottom: 40 }, style]} {...rest}>
        {children}
      </View>
    </Responsive>
  );
}

export default FormRow;
