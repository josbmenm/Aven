import React from 'react';
import ViewText from '../views/Text';
import { useTheme, createVariant } from './Theme';
import { Responsive } from './Responsive';

function Text({
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
  let boldStyle = bold ? { fontWeight: 'bold' } : {};
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

export default Text;
