import React from 'react';
import { Text } from 'react-native';
import { SharedText } from '../navigation-transitioner/Shared';

export default function SharedIcon({ style, icon, ...props }) {
  return (
    <SharedText
      color={style.color}
      fontSize={style.fontSize}
      id={icon}
      {...props}
    >
      {icon}
    </SharedText>
  );
}
