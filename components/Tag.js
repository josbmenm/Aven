import React from 'react';
import { Text, View } from 'react-native';
import { boldPrimaryFontFace } from './Styles';
import { useTheme, Large } from '../ui-library/Theme';

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
          fontSize: 14,
          paddingVertical: 4,
          paddingHorizontal: 8,
        }
      : {
          fontSize: 22,
        };
  const theme = useTheme({
    ...sizeTheme,
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
        backgroundColor,
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

// Tag.neutralColor = '#444';
// Tag.negativeColor = '#722';
// Tag.positiveColor = '#272';
// Tag.warningColor = '#997200';
