import React from 'react';
import FunctionalLink from '../navigation-web/Link';
import VisualButton from '../dashboard-ui-deprecated/VisualButton';
import { useTheme } from '../dashboard-ui-deprecated/Theme';

function Link({
  buttonStyle,
  titleStyle,
  title = 'link',
  size = 'small',
  routeName,
  params,
  target,
  url,
  noActive = false,
  ...rest
}) {
  const theme = useTheme();
  return (
    <FunctionalLink
      routeName={routeName}
      params={params}
      url={url}
      target={target}
      renderContent={active => (
        <VisualButton
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
