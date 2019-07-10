import React from 'react';
import theme from '../theme';

import { MjmlSection, MjmlColumn, MjmlRaw } from 'mjml-react';

function Footer() {
  return (
    <MjmlSection
      backgroundColor="white"
      padding="0"
      paddingLeft="136px"
      paddingRight="136px"
    >
      <MjmlColumn padding="28px 36px 20px 36px">
        <MjmlRaw>
          <div
            style={{
              width: 48,
              height: 48,
              backgroundColor: theme.colors.primary,
            }}
          />
        </MjmlRaw>
      </MjmlColumn>
      <MjmlColumn padding="28px 36px 20px 36px" borderBottom="1px solid hsla(0, 0%, 59%, 0.3)">
        <MjmlRaw>
          <div
            style={{
              width: 48,
              height: 48,
              backgroundColor: theme.colors.primary,
            }}
          />
        </MjmlRaw>
      </MjmlColumn>
      <MjmlColumn padding="28px 36px 20px 36px" borderBottom="1px solid hsla(0, 0%, 59%, 0.3)">
        <MjmlRaw>
          <div
            style={{
              width: 48,
              height: 48,
              backgroundColor: theme.colors.primary,
            }}
          />
        </MjmlRaw>
      </MjmlColumn>
    </MjmlSection>
  );
}

export default Footer;
