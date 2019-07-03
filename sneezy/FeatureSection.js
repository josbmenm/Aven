import React from 'react';
import View from '../views/View';
import Title from './Title';
import { ColumnToRow, ColumnToRowChild } from './Responsive';
import { Responsive } from '../dashboard/Responsive';

function FeatureSection({
  title,
  bodyText,
  image,
  inverted = false,
  style,
  columnReverse,
  responsiveStyles
}) {
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
      <Responsive
        style={{
          paddingLeft: [0, inverted ? 0 : 20],
        }}
      >
        <ColumnToRowChild
          style={{
            paddingVertical: 40,
            paddingRight: 20,
            justifyContent: 'center',
          }}
        >
          <Responsive style={{
            ...responsiveStyles
          }}>
          <Title>{title}</Title>
          {bodyText}
          </Responsive>
        </ColumnToRowChild>
      </Responsive>
    </ColumnToRow>
  );
}

export default FeatureSection;
