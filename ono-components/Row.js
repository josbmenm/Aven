import React from 'react';
import { TouchableHighlight, View, Text } from 'react-native';
import { rowStyle } from './Styles';

const Row = ({ children }) => {
  return <View style={{ ...rowStyle, flexDirection: 'row' }}>{children}</View>;
};

export default Row;
