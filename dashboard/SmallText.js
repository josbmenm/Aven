import React from 'react';
import BaseText from './BaseText';

export default function SmallText({ size, ...props }) {
  const textSize = size || 'large';
  return <BaseText size={textSize} {...props} />;
}
