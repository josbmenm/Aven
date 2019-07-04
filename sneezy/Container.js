import React from 'react';
import View from '../views/View';
import { useTheme } from '../dashboard/Theme'

function Container({ children, className, style = {} }) {
  const theme = useTheme();
  return (
    <View
      style={{
        width: '90%',
        maxWidth: theme.layouts.large,
        alignItems: 'stretch',
        alignSelf: 'center',
        ...style,
      }}
      className={className} // TODO: remove this className (web specific)
    >
      {children}
    </View>
  );
}

export default Container;
