import React from 'react'
import FunctionalLink from '../navigation-web/Link';
import UIButton from '../dashboard/UIButton';
import { useTheme } from '../dashboard/Theme';

function Link({
  buttonStyle = {},
  titleStyle = {},
  title = 'link',
  size = 'Small',
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
          title={title}
          buttonStyle={{
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderColor: 'transparent',
            borderBottomWidth: 0,
            ...buttonStyle,
          }}
          type="outline"
          titleStyle={{
            color: theme.colors.monsterra,
            fontSize: size === 'Small' ? 16 : 24,
            ...titleStyle,
          }}
        />
      )}
    />
  );
}

export default Link;
