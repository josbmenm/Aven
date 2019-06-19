import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ColumnToRow, ColumnToRowChild, Title, Responsive } from './Tokens';
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
    <ColumnToRow
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
      <ColumnToRowChild inverted={inverted}>{image}</ColumnToRowChild>
      <Responsive style={{ paddingLeft: [0, 100] }}>
        <ColumnToRowChild
          style={{
            paddingVertical: 40,
            paddingRight: 40,
            justifyContent: 'center',
          }}
        >
          <Title>{title}</Title>
          {bodyText}
        </ColumnToRowChild>
      </Responsive>
    </ColumnToRow>
  );
}

export default FeatureSection;
