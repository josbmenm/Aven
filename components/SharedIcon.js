import React from 'react';
import { Text as BaseText } from 'react-native';
import { Text, useTheme } from '../dash-ui';

export default function SharedIcon({ style, icon, color, theme: themeProp }) {
  const theme = useTheme(themeProp);
  return <Text theme={{ ...themeProp, color }}>{icon}</Text>;
}
