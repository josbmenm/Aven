import React from 'react';
import BaseText from './BaseText';

function BodyText({ size, ...props}) {
  return <BaseText size="large" {...props} />;
}

export default BodyText;
