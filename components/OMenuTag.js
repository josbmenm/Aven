import React from 'react';
import { SmallTag, useTheme } from '../dash-ui';

export default function OMenuTag({ theme: themeProp, ...restProps }) {
  const theme = useTheme(themeProp);
  return (
    <SmallTag {...restProps} theme={{ colorForeground: theme.colorPrimary }} />
  );
}
