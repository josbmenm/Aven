import React from 'react';
import { View, Text } from 'react-native';
import { rowStyle, rowTitleStyle } from './Styles';

const ButtonRow = ({ children, title }) => {
  return (
    <View
      style={{
        ...rowStyle,
        justifyContent: 'flex-end',
        // backgroundColor: 'red',
        flexWrap: 'wrap',
      }}
    >
      <View style={{ flex: 1, height: '100%' }}>
        {title && (
          <Text style={[rowTitleStyle, { backgroundColor: 'red', height: 80 }]}>
            {title}
          </Text>
        )}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        {children}
      </View>
    </View>
  );
};

export default ButtonRow;
