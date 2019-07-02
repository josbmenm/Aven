import React from 'react';
import View from '../views/View';
import Title from './Title';
import { ColumnToRow, ColumnToRowChild, Responsive } from './Responsive';
import { aspectRatio43 } from '../components/Styles';
import { useTheme } from '../dashboard/Theme';

function FeatureSection({
  title,
  bodyText,
  image,
  inverted = false,
  style,
  columnReverse,
}) {
  const theme = useTheme();
  // TODO: remove after definitive images
  if (!image) {
    image = (
      <Responsive
        style={{
          maxWidth: ['100%', 400],
        }}
      >
        <View
          style={[
            {
              backgroundColor: theme.colors.lightGrey,
            },
            aspectRatio43,
          ]}
        />
      </Responsive>
    );
  }
  return (
    <ColumnToRow
      rowReverse={inverted}
      columnReverse={columnReverse}
      style={[
        {
          alignSelf: 'center',
          justifyContent: 'space-between',
          width: '100%',
        },
        style,
      ]}
    >
      <Responsive
        style={{
          alignItems: ['stretch', inverted ? 'flex-end' : 'flex-start'],
        }}
      >
        <ColumnToRowChild>{image}</ColumnToRowChild>
      </Responsive>
      <ColumnToRowChild
        style={{
          paddingVertical: 40,
          paddingHorizontal: 20,
          justifyContent: 'center',
        }}
      >
        <Title>{title}</Title>
        {bodyText}
      </ColumnToRowChild>
    </ColumnToRow>
  );
}

export default FeatureSection;
