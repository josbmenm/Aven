import React from 'react';
import { TouchableHighlight, View, Text } from 'react-native';
import { rowStyle, rowTitleStyle } from './Styles';

const Row = ({ children, title }) => {
  return (
    <View style={{ ...rowStyle }}>
      {title && <Text style={rowTitleStyle}>{title}</Text>}
      <View style={{ flexDirection: 'row' }}>{children}</View>
    </View>
  );
};

export default Row;
