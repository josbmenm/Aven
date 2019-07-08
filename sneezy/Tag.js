import React from 'react';
import SmallText from '../dashboard/SmallText';
import { useTheme } from '../dashboard/Theme';

function Tag({ title, size, style, responsiveStyle, ...rest }) {
  const theme = useTheme();
  return (
    <SmallText
      bold
      size={size}
      responsiveStyle={responsiveStyle}
      style={{
        fontSize: 10,
        lineHeight: 13,
        textTransform: 'uppercase',
        paddingVertical: 4,
        paddingHorizontal: 16,
        borderRadius: 4,
        backgroundColor: theme.colors.monsterras[0],
        color: theme.colors.white,
        minWidth: 120,
        textAlign: 'center',
        letterSpacing: 2.5,
        ...style,
      }}
      {...rest}
    >
      {title}
    </SmallText>
  );
}

export default Tag;
