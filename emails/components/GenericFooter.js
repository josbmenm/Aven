import React from 'react';
import { MjmlSection, MjmlColumn, MjmlSpacer } from 'mjml-react';
import theme from '../theme';
import Text from './Text';

function GenericFooter() {
  return (
    <MjmlSection
      backgroundColor="white"
      paddingTop="36px"
      paddingBottom="36px"
      paddingLeft="24px"
      paddingRight="24px"
    >
      <MjmlColumn padding="0px">
        <Text {...theme.textStyles.small} fontWeight="bold">
          Questions?
        </Text>
        <Text variant="small">
          Contact us at&nbsp;
          <a
            style={{ textDecoration: 'none', color: 'inherit' }}
            href="mailto:lucy@onofood.co"
          >
            lucy@onofood.co
          </a>
        </Text>
      </MjmlColumn>
      <MjmlColumn padding="0px">
        {/* <Text align="right" variant="small">
          No longer wish to receive these emails?
        </Text>
        <Text align="right" variant="small">
          please&nbsp;
          <a style={{ textDecoration: 'underline', color: 'inherit' }} href="#">
            unsubscribe
          </a>
        </Text>
        <MjmlSpacer height="16px" /> */}
        <Text align="right" variant="small">
          Ono Food Co.
        </Text>
        <Text align="right" variant="small">
          915 Venice Blvd. Los Angeles, CA 90015
        </Text>
      </MjmlColumn>
    </MjmlSection>
  );
}

export default GenericFooter;
