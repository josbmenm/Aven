import React from 'react';
import { Text } from 'react-native';
import { titleStyle } from './Styles';

export default function Subtitle({ title }) {
  return (
    <Text style={{ ...titleStyle, opacity: 0.8, fontSize: 20 }}>{title}</Text>
  );
}
