import React from 'react';
import FunctionalLink from '../navigation-web/Link';
import OnoBlendsLogo from './OnoBlendsLogo';

export default function OnoHomeLink() {
  return (
    <FunctionalLink
      routeName="Home"
      accesible="true"
      accessibilityRole="button"
      accessibilityLabel="Logo"
      renderContent={() => <OnoBlendsLogo />}
    />
  );
}
