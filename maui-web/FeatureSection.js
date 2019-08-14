import React from 'react';
import Heading from '../dashboard/Heading';
import { ColumnToRow, ColumnToRowChild } from '../dashboard/Responsive';
import { Responsive } from '../dashboard/Responsive';

function FeatureSection({
  title,
  bodyText,
  titleStyle,
  image,
  inverted = false,
  style,
  columnReverse,
  responsiveStyles,
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
          paddingRight: [0, inverted ? 20 : 0],
          paddingVertical: [40, 40],

          ...responsiveStyles,
        }}
      >
        <ColumnToRowChild
          style={{
            justifyContent: 'center',
          }}
        >
          <Heading size="small" style={titleStyle}>
            {title}
          </Heading>
          {bodyText}
        </ColumnToRowChild>
      </Responsive>
    </ColumnToRow>
  );
}

export default FeatureSection;
