import React from 'react';
import FunctionalLink from '../navigation-web/Link';
import VisualButton from '../dashboard/VisualButton';
import { useTheme } from '../dashboard/Theme';

function Link({
  buttonStyle,
  titleStyle,
  title = 'link',
  size = 'small',
  routeName,
  target,
  url,
  noActive = false,
  ...rest
}) {
  const theme = useTheme();
  return (
    <FunctionalLink
      routeName={routeName}
      url={url}
      target={target}
      renderContent={active => (
        <VisualButton
          outline
          active={active}
          title={title}
          buttonStyle={{
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderColor: 'transparent',
            borderBottomWidth: 0,
            ...buttonStyle,
          }}
          titleStyle={{
            color: theme.colors.primary,
            fontSize: size === 'large' ? 24 : 16,
            ...titleStyle,
          }}
        />
      )}
    />
  );
}

export default Link;
