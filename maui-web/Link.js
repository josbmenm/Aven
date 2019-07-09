import React from 'react';
import FunctionalLink from '../navigation-web/Link';
import UIButton from '../dashboard/UIButton';
import { useTheme } from '../dashboard/Theme';

function Link({
  buttonStyle,
  titleStyle,
  title = 'link',
  size = 'small',
  routeName,
  url,
  noActive = false,
  ...rest
}) {
  const theme = useTheme();
  return (
    <FunctionalLink
      routeName={routeName}
      url={url}
      renderContent={active => (
        <UIButton
          type="outline"
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
            color: theme.colors.monsterra,
            fontSize: size === 'large' ? 24 : 16,
            ...titleStyle,
          }}
        />
      )}
    />
  );
}

export default Link;
