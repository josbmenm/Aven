import React from 'react';
import { View, Text } from 'react-native';
import { rowStyle, rowTitleStyle } from './Styles';

const ButtonRow = ({ children, title }) => {
  return (
    <View
      style={{
        ...rowStyle,
        justifyContent: 'flex-end',
        flexWrap: 'wrap',
      }}
    >
      <View style={{ flex: 1 }}>
        {title && <Text style={rowTitleStyle}>{title}</Text>}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        {children}
      </View>
    </View>
  );
};

export default ButtonRow;
