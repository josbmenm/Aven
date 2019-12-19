import React from 'react';
import { View, Text } from 'react-native';
import { Spacing } from '../dash-ui/Theme';
import { rowStyle, rowTitleStyle } from './Styles';

const Row = ({ children, title, containerStyle }) => {
  return (
    <View>
      {title && (
        <Spacing horizontal={8}>
          <Text style={rowTitleStyle}>{title}</Text>
        </Spacing>
      )}
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
