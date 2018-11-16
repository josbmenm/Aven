import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { intRowStyle } from './Styles';

const IntRow = ({ title, value }) => (
  <View
    style={{
      ...intRowStyle,
      flexDirection: 'row',
      justifyContent: 'space-between',
    }}
  >
    <Text
      style={{
        fontSize: 32,
      }}
    >
      {title}
    </Text>
    <View>
      <Text
        style={{
          fontSize: 24,
        }}
      >
        {value}
      </Text>
    </View>
  </View>
);

export default IntRow;
