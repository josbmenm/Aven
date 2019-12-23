import React from 'react';
import { View } from 'react-native';
import { Spacing } from '../dash-ui';

export default function BlockFormHorizontalRule() {
  return (
    <Spacing vertical={8} horizontal={16}>
      <View
        style={{
          alignSelf: 'stretch',
          height: 1,
          backgroundColor: '#00000014',
        }}
      />
    </Spacing>
  );
}
