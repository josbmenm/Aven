import React from 'react';
import Heading from '../ui-library/composite/Heading';

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
