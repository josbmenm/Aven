import React from 'react';
import { View } from 'react-native';
import { useTheme } from './ThemeContext';

function Container({ children, style = {} }) {
  const theme = useTheme();
  return (
    <View
      style={{
        width: '90%',
        maxWidth: theme.layoutWidth.large,
        alignItems: 'stretch',
        alignSelf: 'center',
        ...style,
      }}
    >
      {children}
    </View>
  );
}

export default Container;
