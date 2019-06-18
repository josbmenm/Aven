import React from 'react';
import { View, StyleSheet } from 'react-native';
import { V2HLayout, V2HLayoutChild, Title, Responsive } from './Tokens';
import { aspectRatio43 } from '../components/Styles';
import { useTheme } from './ThemeContext';

function FeatureSection({
  title,
  bodyText,
  image,
  inverted = false,
  style = {},
}) {
  const theme = useTheme();
  // TODO: remove after definitive images
  if (!image) {
    image = (
      <View
        style={{
          maxWidth: 630,
          ...aspectRatio43,
          backgroundColor: theme.colors.lightGrey,
        }}
      />
    );
  }
  return (
    <V2HLayout
      rowReverse={inverted}
      style={StyleSheet.flatten([
        {
          alignSelf: 'center',
          justifyContent: 'space-between',
          width: '100%',
        },
        style,
      ])}
    >
      <V2HLayoutChild inverted={inverted}>{image}</V2HLayoutChild>
      <Responsive style={{ paddingLeft: [0, 100] }}>
        <V2HLayoutChild
          style={{
            paddingVertical: 40,
            paddingRight: 40,
            justifyContent: 'center',
          }}
        >
          <Title>{title}</Title>
          {bodyText}
        </V2HLayoutChild>
      </Responsive>
    </V2HLayout>
  );
}

export default FeatureSection;
