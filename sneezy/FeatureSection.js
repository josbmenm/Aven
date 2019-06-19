import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Title } from './Tokens';
import { ColumnToRow, ColumnToRowChild, Responsive } from './Responsive';
import { aspectRatio43 } from '../components/Styles';
import { useTheme } from './ThemeContext';

function FeatureSection({
  title,
  bodyText,
  image,
  inverted = false,
  style = {},
  columnReverse,
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
      columnReverse={columnReverse}
      style={StyleSheet.flatten([
        {
          alignSelf: 'center',
          justifyContent: 'space-between',
          width: '100%',
        },
        style,
      ])}
    >
      <ColumnToRowChild>{image}</ColumnToRowChild>
      <ColumnToRowChild
        style={{
          paddingVertical: 40,
          paddingRight: 20,
          justifyContent: 'center',
        }}
      >
        <Responsive
          style={{
            paddingLeft: inverted ? [0, 0] : [0, 100],
          }}
        >
          <View>
            <Title>{title}</Title>
            {bodyText}
          </View>
        </Responsive>
      </ColumnToRowChild>
    </ColumnToRow>
  );
}

export default FeatureSection;
