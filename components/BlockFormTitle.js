import React from 'react';
import { Text } from 'react-native';
import { blockFormTitleTextStyle } from './Styles';
import Heading from '../ui-library/composite/Heading';
import { Spacing } from '../ui-library/Theme';

export default function BlockFormTitle({ title }) {
  return (
    <Heading
      title={title}
      theme={{
        headingFontSize: 36,
        headingLineHeight: 44,
      }}
    />
  );
}
