import React from 'react';
import { View } from 'react-native';
import Title from '../dashboard/Title';

import { ColumnToRow, ColumnToRowChild } from '../maui-web/Responsive';

export default function EmailsPlayground({}) {
  return (
    <ColumnToRow>
      <ColumnToRowChild>
        <Title
          style={{ textAlign: 'center' }}
          responsiveStyle={{
            marginBottom: [0, 24],
          }}
        >
          coming soon..
        </Title>
      </ColumnToRowChild>
      <ColumnToRowChild>
        <Title
          style={{ textAlign: 'center' }}
          responsiveStyle={{
            marginBottom: [0, 24],
          }}
        >
          coming soon..
        </Title>
      </ColumnToRowChild>
    </ColumnToRow>
  );
}
