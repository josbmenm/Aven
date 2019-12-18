import React from 'react';
import Heading from '../dash-ui/Heading';

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
