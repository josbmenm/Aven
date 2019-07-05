import React from 'react'
import FootNote from './FootNote';
import { useTheme } from '../dashboard/Theme';

function Tag({ title, style, ...rest }) {
  const theme = useTheme();
  return (
    <FootNote
      bold
      style={[{
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
      }, style]}
      {...rest}
    >
      {title}
    </FootNote>
  );
}

export default Tag;
