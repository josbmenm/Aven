import React from 'react';
import View from '../views/View';
import { useTheme } from './Theme';
import { Responsive } from './Responsive';

function Container({
  children,
  responsiveStyle,
  fullWidth,
  nativeID,
  style = {},
}) {
  const theme = useTheme();
  return (
    <Responsive
      style={{
        ...responsiveStyle,
      }}
    >
      <View
        testID={fullWidth ? 'FullWidthContainer' : 'Container'}
        style={{
          width: fullWidth ? '100%' : '90%',
          maxWidth: theme.layouts.large,
          alignItems: 'stretch',
          alignSelf: 'center',
          ...style,
        }}
        nativeID={nativeID}
      >
        {children}
      </View>
    </Responsive>
  );
}

export default Container;
