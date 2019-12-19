import React from 'react';
import { View, Text } from 'react-native';
import { Spacing } from '../dash-ui/Theme';
import Stack from '../dash-ui/Stack';
import { rowStyle, rowTitleStyle } from './Styles';

const Row = ({ children, title, containerStyle }) => {
  return (
    <Spacing bottom={24}>
      {title && (
        <Spacing horizontal={8}>
          <Text style={rowTitleStyle}>{title}</Text>
        </Spacing>
      )}
      <Stack horizontal>{children}</Stack>
      {/* <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
          width: '100%',
          // flex: 1,
          ...containerStyle,
        }}
      >
        {children}
      </View> */}
    </Spacing>
  );
};

export default Row;
