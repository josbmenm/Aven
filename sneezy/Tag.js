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
        textTransform: 'uppercase',
        alignSelf: 'flex-start',
        paddingVertical: 4,
        paddingHorizontal: 16,
        borderRadius: 4,
        backgroundColor: theme.colors.primary70,
        color: theme.colors.white,
        minWidth: 120,
        textAlign: 'center',
        letterSpacing: 3,
      }, style]}
      {...rest}
    >
      {title}
    </FootNote>
  );
}

export default Tag;
