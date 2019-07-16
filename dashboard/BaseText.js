import React from 'react';
import ViewText from '../views/Text';
import { useTheme, createVariant } from './Theme';
import { Responsive } from './Responsive';

function BaseText({
  children,
  bold,
  style,
  responsiveStyle,
  breakpoints,
  size = 'medium', // 'small' | 'mmedium' | 'large'
  ...rest
}) {
  const theme = useTheme();
  const sizeVariant = React.useMemo(
    () => createVariant({ theme, key: 'textStyles' }),
    [theme],
  );
  let boldStyle = bold
    ? { fontWeight: 'bold', fontFamily: theme.fonts.bold }
    : {};
  return (
    <Responsive
      breakpoints={breakpoints}
      style={{
        ...sizeVariant(size),
        ...responsiveStyle,
      }}
    >
      <ViewText
        style={{
          color: theme.colors.monsterra,
          fontFamily: theme.fonts.serif,
          ...boldStyle,
          ...style,
        }}
        {...rest}
      >
        {children}
      </ViewText>
    </Responsive>
  );
}

export default BaseText;
