import React from 'react';
import { View } from 'react-native';
import { Responsive } from '../dashboard-ui-deprecated/Responsive';

function FormRow({ children, style, direction = 'column', ...rest }) {
  return (
    <Responsive
      style={{
        flexDirection: ['column', direction],
      }}
    >
      <View style={{ marginBottom: 24, ...style }} {...rest}>
        {children}
      </View>
    </Responsive>
  );
}

export default FormRow;
