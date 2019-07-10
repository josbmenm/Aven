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
        <MjmlColumn />
        <MjmlColumn padding="0">
          <MjmlImage
            fluidOnMobile="true"
            width="150px"
            src={'https://via.placeholder.com/260x132'}
          />
        </MjmlColumn>
        <MjmlColumn />
      </MjmlSection>
  );
}

export default Header;
