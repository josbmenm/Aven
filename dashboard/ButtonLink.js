import React from 'react';
import FunctionalLink from '../navigation-web/Link';
import VisualButton from './VisualButton';

function ButtonLink({
  title = 'button',
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
