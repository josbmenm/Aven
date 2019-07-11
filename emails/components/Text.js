import React from 'react';
import { MjmlText } from 'mjml-react';
import theme from '../theme';

function Text({ variant = 'body', ...rest }) {
  return <MjmlText padding="0px" {...theme.textStyles[variant]} color={theme.colors.primary} {...rest} />;
}

export default Text;
