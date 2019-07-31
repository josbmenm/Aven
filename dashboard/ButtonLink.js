import React from 'react';
import FunctionalLink from '../navigation-web/Link';
import VisualButton from './VisualButton';

function ButtonLink({
  title = 'link',
  type = 'solid', // solid | outline | link
  buttonStyle,
  titleStyle,
  routeName,
  url,
  ...rest
}) {
  return (
    <FunctionalLink
      routeName={routeName}
      url={url}
      accesible="true"
      accessibilityRole="link"
      accessibilityLabel={title}
      renderContent={active => (
        <VisualButton
          type={type}
          active={active}
          buttonStyle={buttonStyle}
          titleStyle={titleStyle}
          title={title}
          {...rest}
        />
      )}
    />
  );
}

export default ButtonLink;
