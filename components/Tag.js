import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../dash-ui';
import { opacify, useStatusColor } from '../dash-ui/utils';

export default function Tag({
  title,
  size = 'regular',
  status = 'neutral', // positive | negative | warning
  theme: themeProp,
}) {
  const sizeTheme =
    size === 'small'
      ? {
          fontSize: 16,
          paddingVertical: 4,
          paddingHorizontal: 8,
        }
      : {
          fontSize: 22,
        };
  const theme = useTheme({
    ...sizeTheme,
    // this could be a function
    ...themeProp,
  });

  const color = useStatusColor({ status });

  return (
    <View
      style={{
        borderRadius: theme.borderRadius,
        backgroundColor: opacify(color, 0.8),
        paddingVertical: theme.paddingVertical,
        paddingHorizontal: theme.paddingHorizontal,
        minWidth: size === 'small' ? null : 150,
      }}
    >
      <Text
        style={{
          fontFamily: theme.fontBold,
          color: 'white',
          fontSize: theme.fontSize,
          // fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
    </View>
  );
}
