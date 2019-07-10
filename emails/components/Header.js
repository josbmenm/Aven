import React from 'react';
import { MjmlSection, MjmlColumn, MjmlImage } from 'mjml-react';
import theme from '../theme';

function Header() {
  return (
    <MjmlSection
      backgroundColor="white"
      padding="0"
      borderBottom={`1px solid ${theme.colors.primary}`}
    >
      <MjmlColumn padding="0" verticalAlign="top">
        <MjmlImage
          align="left"
          padding="0"
          width="88px"
          height="64px"
          src="https://emailassets-kglyyrazbw.now.sh/email_top-left-corner.png"
        />
      </MjmlColumn>
      <MjmlColumn padding="0" verticalAlign="middle">
        <MjmlImage
          width="150px"
          src="https://emailassets-kglyyrazbw.now.sh/email_logo.png"
        />
      </MjmlColumn>
      <MjmlColumn verticalAlign="bottom" padding="0">
        <MjmlImage
          align="right"
          padding="0"
          width="104px"
          height="66px"
          src="https://emailassets-kglyyrazbw.now.sh/email_bottom-right-corner.jpg"
        />
      </MjmlColumn>
    </MjmlSection>
  );
}

export default Header;
