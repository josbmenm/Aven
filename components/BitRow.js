import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { bitRowStyle } from './Styles';

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
    <View
      style={{
        borderRadius: 40,
        backgroundColor: value ? '#282' : '#822',
        padding: 10,
        width: 150,
      }}
    >
      <Text
        style={{
          color: 'white',
          fontSize: 24,
          fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        {value ? 'True' : 'False'}
      </Text>
    </View>
  </View>
);

export default BitRow;
