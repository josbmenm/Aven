import React from 'react';
import { Link as FunctionalLink } from '@aven/navigation-web';
import VisualButton from './VisualButton';

function ButtonLink({
  title = 'link',
  type = 'solid', // solid | outline | link
  buttonStyle,
  titleStyle,
  routeName,
  url,
  target,
  ...rest
}) {
  return (
    <FunctionalLink
      routeName={routeName}
      url={url}
      accesible="true"
      accessibilityRole="link"
      accessibilityLabel={title}
      target={target}
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
