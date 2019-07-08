import React from 'react';
import SmallText from './SmallText';
import { useTheme } from './Theme';

function Tag({ title, size, style, responsiveStyle, ...rest }) {
  const theme = useTheme();
  let tagSize =
    size === 'small'
      ? {
          paddingVertical: 2,
          paddingHorizontal: 8,
          minWidth: 100,
        }
      : size === 'large'
      ? {
          paddingVertical: 8,
          paddingHorizontal: 20,
          minWidth: 160,
        }
      : {
          paddingVertical: 4,
          lineHeight: 13,
          paddingHorizontal: 16,
          minWidth: 120,
        };
  return (
    <SmallText
      bold
      size={size}
      responsiveStyle={responsiveStyle}
      style={{
        textTransform: 'uppercase',
        borderRadius: 4,
        backgroundColor: theme.colors.monsterras[0],
        color: theme.colors.white,
        textAlign: 'center',
        letterSpacing: 2.5,
        ...tagSize,
        ...style,
      }}
      {...rest}
    >
      {title}
    </SmallText>
  );
}

export default Tag;
