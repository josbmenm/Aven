import React from 'react';
import { Text } from 'react-native';
import { Spacing } from '../dash-ui/Theme';
import Stack from '../dash-ui/Stack';
import { rowStyle, rowTitleStyle } from './Styles';

const Row = ({ children, title, containerStyle }) => {
  return (
    <Spacing bottom={18} top={8}>
      {title && (
        <Spacing horizontal={8}>
          <Text style={rowTitleStyle}>{title}</Text>
        </Spacing>
      )}
      <Stack horizontal>{children}</Stack>
    </Spacing>
  );
};

export default Row;
