import React, { useEffect } from 'react';
import { useTheme } from './Theme';

export function opacify(H, opacity) {
  // Convert hex to RGB first
  let r = 0,
    g = 0,
    b = 0;
  if (H.length == 4) {
    r = '0x' + H[1] + H[1];
    g = '0x' + H[2] + H[2];
    b = '0x' + H[3] + H[3];
  } else if (H.length == 7) {
    r = '0x' + H[1] + H[2];
    g = '0x' + H[3] + H[4];
    b = '0x' + H[5] + H[6];
  }

  // Then to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  let cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin,
    h = 0,
    s = 0,
    l = 0;

  if (delta == 0) h = 0;
  else if (cmax == r) h = ((g - b) / delta) % 6;
  else if (cmax == g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return `hsla(${h}, ${s}%, ${l}%, ${opacity})`;
}

export function useStatusColor({ status, theme: currentTheme }) {
  if (status === undefined) {
    throw new Error('status must be provided to useStatusColor hook');
  }

  const theme = currentTheme || useTheme();
  const [color, setColor] = React.useState(theme.colorTint);

  useEffect(() => {
    let statusColor;

    switch (status) {
      case 'positive':
        statusColor = theme.colorPositive;
        break;
      case 'negative':
        statusColor = theme.colorNegative;
        break;
      case 'warning':
        statusColor = theme.colorWarning;
        break;
      default:
        statusColor = theme.colorPrimary;
        break;
    }

    setColor(statusColor);
  }, [status]);

  return color;
}
