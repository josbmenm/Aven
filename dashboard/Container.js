import React from 'react';
import View from '../views/View';
import { useTheme } from './Theme';
import { Responsive } from './Responsive';

function Container({ children, responsiveStyle, style = {} }) {
  const theme = useTheme();
  return (
    <Responsive
      style={{
        ...responsiveStyle,
      }}
    >
      <View
        style={{
          width: '90%',
          maxWidth: theme.layouts.large,
          alignItems: 'stretch',
          alignSelf: 'center',
          ...style,
        }}
      >
        {children}
      </View>
    </Responsive>
  );
}

export default Container;
