import React from 'react';
import BaseText from './BaseText';

export default function SmallText(props) {
  const textSize = size || 'large';
  return <BaseText size={textSize} {...props} />;
}
