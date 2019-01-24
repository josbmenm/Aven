import React from 'react';
import { View } from 'react-native';
import { highlightPrimaryColor } from '../../components/Styles';

export default function BlockFormHorizontalRule() {
  return (
    <View
      style={{
        alignSelf: 'stretch',
        height: 1,
        backgroundColor: '#00000014',
        marginVertical: 15,
        marginHorizontal: 10,
      }}
    />
  );
}
