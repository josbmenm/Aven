import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { bitRowStyle } from './Styles';
import Tag from './Tag';

const BitRow = ({ title, value }) => (
  <View
    style={{
      ...bitRowStyle,
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
    <Tag color={value ? '#282' : '#822'} title={value ? 'True' : 'False'} />
  </View>
);

export default BitRow;
