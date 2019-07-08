import React from 'react';
import FunctionalLink from '../navigation-web/Link';
import UIButton from '../dashboard/UIButton';

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
        <UIButton
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
