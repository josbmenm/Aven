import React from 'react';
import { Text, View } from 'react-native';
import { boldPrimaryFontFace } from './Styles';
import { useTheme, Large } from '../dash-ui/Theme';
import { opacify } from '../dash-ui/utils';

export default function Tag({
  title,
  color,
  style,
  size = 'regular',
  status = 'neutral', // positive | negative | warning
  theme: themeProp = {},
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

  let backgroundColor = theme.colorPrimary;

  switch (status) {
    case 'positive':
      backgroundColor = theme.colorPositive;
      break;
    case 'negative':
      backgroundColor = theme.colorNegative;
      break;
    case 'warning':
      backgroundColor = theme.colorWarning;
      break;
    case 'positive':
      backgroundColor = theme.colorPrimary;
      break;
  }

  return (
    <View
      style={{
        borderRadius: theme.borderRadius,
        backgroundColor: opacify(backgroundColor, 0.8),
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
