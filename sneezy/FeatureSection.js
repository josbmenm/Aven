import React from 'react';
import { View } from 'react-native';
import { V2HLayout, V2HLayoutChild, Title } from './Tokens';
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
      style={{ maxWidth: 630, ...aspectRatio43, backgroundColor: theme.colors.lightGrey }}
      />
    );
  }
  return (
    <V2HLayout
      rowReverse={inverted}
      style={{
        alignSelf: 'center',
        justifyContent: 'space-between',
        ...style,
      }}
    >
      <V2HLayoutChild inverted={inverted}>{image}</V2HLayoutChild>
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
    </V2HLayout>
  );
}

export default FeatureSection;
