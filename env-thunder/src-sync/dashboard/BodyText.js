import React from 'react';
import BaseText from './BaseText';

function BodyText({ size, ...props }) {
  const textSize = size || 'large';
  return <BaseText size={textSize} {...props} />;
}

export default BodyText;
