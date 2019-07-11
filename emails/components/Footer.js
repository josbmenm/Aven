import React from 'react';
import {
  MjmlSection,
  MjmlColumn,
  MjmlRaw,
  MjmlImage,
  MjmlDivider,
  MjmlSpacer,
} from 'mjml-react';
import theme from '../theme';
import Text from './Text'

function FooterText({ children }) {
  return (
    <Text
      align="center"
      padding="0px"
      fontSize="7px"
      lineHeight="9px"
      color="#9B9B9B"
    >
      {children}
    </Text>
  );
}

function Footer() {
  return (
    <React.Fragment>
      <MjmlSection
        backgroundColor="white"
        paddingTop="28px"
        paddingLeft="136px"
        paddingRight="136px"
        paddingBottom="20px"
      >
        <MjmlColumn verticalAlign="middle" padding="0px">
          <MjmlImage
            padding="0px"
            src="https://onofood.co/img/social_instagram.png"
            width="28px"
          />
        </MjmlColumn>
        <MjmlColumn verticalAlign="middle" padding="0px">
          <MjmlImage
            padding="0px"
            src="https://onofood.co/img/social_twitter.png"
            width="28px"
          />
        </MjmlColumn>
        <MjmlColumn verticalAlign="middle" padding="0px">
          <MjmlImage
            padding="0px"
            src="https://onofood.co/img/social_facebook.png"
            width="28px"
          />
        </MjmlColumn>
      </MjmlSection>

      <MjmlSection
        backgroundColor="white"
        padding="0px"
        paddingLeft="136px"
        paddingRight="136px"
      >
        <MjmlColumn verticalAlign="middle" padding="0px">
          <MjmlDivider borderWidth="1px" borderColor="rgba(151,151,151, 0.3)" />
        </MjmlColumn>
      </MjmlSection>

      <MjmlSection padding="0px" backgroundColor="white">
        <MjmlColumn padding="0px 0px 20px 0px">
          <FooterText>No longer wish to receive these emails?</FooterText>
          <FooterText>please unsubscribe</FooterText>
          <MjmlSpacer height="10px" />
          <FooterText>Ono Food Co.</FooterText>
          <FooterText>915 Venice Blvd. Los Angeles, CA 90015</FooterText>
        </MjmlColumn>
      </MjmlSection>
    </React.Fragment>
  );
}

export default Footer;
