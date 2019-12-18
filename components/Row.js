import React from 'react';
import { TouchableHighlight, View, Text } from 'react-native';
import { rowStyle, rowTitleStyle } from './Styles';

const Row = ({ children, title, containerStyle }) => {
  return (
    <View style={{ ...rowStyle }}>
      {title && <Text style={rowTitleStyle}>{title}</Text>}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
          ...containerStyle,
        }}
      >
        {children}
      </View>
    </View>
  );
};

export default Row;
