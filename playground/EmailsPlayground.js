import React from 'react';
import { View } from 'react-native';
import Title from '../dashboard/Title';
import Button from '../dashboard/Button';
import EmailExamples from '../emails/EmailExamples';

import { ColumnToRow, ColumnToRowChild } from '../maui-web/Responsive';

const EmailExampleList = Object.entries(EmailExamples);

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
        {EmailExampleList.map(([exampleName, exampleSpec]) => (
          <Button onPress={() => {}} title={exampleName} />
        ))}
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
