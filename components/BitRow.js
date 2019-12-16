import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { bitRowStyle, genericText } from './Styles';
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
        ...genericText,
      }}
    >
      {title}
    </Text>
    <Tag
      status={value ? 'positive' : 'negative'}
      title={value ? 'True' : 'False'}
    />
  </View>
);

export default BitRow;
