import React from 'react';
import Text from '../views/Text';
import { useTheme, createVariant } from './Theme';
import { Responsive } from './Responsive';

function Heading({
  children,
  style,
  responsiveStyle,
  variant = 'medium', // 'small' | 'medium' | 'large'
  breakpoints,
  ...rest
}) {
  const theme = useTheme();
  const headingVariant = React.useMemo(
    () => createVariant({ theme, key: 'headingStyles' }),
    [theme],
  );
  return (
    <Responsive
      breakpoints={breakpoints}
      style={{
        ...headingVariant(variant),
        ...responsiveStyle,
      }}
    >
      <Text
        style={{
          color: theme.colors.monsterra,
          fontFamily: theme.fonts.bold,
          ...style,
        }}
        {...rest}
      >
        {children}
      </Text>
    </Responsive>
  );
}

export default Heading;
