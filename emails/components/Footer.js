import React from 'react';
import {
  MjmlSection,
  MjmlColumn,
  MjmlRaw,
  MjmlImage,
  MjmlDivider,
  MjmlSpacer,
  MjmlButton,
} from 'mjml-react';
import theme from '../theme';
import BaseText from './Text';

function Text({ children }) {
  return (
    <BaseText
      {...theme.textStyles.xsmall}
      align="center"
      padding="0px"
      color="#9B9B9B"
    >
      {children}
    </BaseText>
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
            href="https://www.instagram.com/onofoodco/"
            padding="0px"
            src="https://onofood.co/img/social_instagram.png"
            width="28px"
          />
        </MjmlColumn>
        <MjmlColumn verticalAlign="middle" padding="0px">
          <MjmlImage
            href="https://twitter.com/onofoodco"
            padding="0px"
            src="https://onofood.co/img/social_twitter.png"
            width="28px"
          />
        </MjmlColumn>
        <MjmlColumn verticalAlign="middle" padding="0px">
          <MjmlImage
            href="https://www.facebook.com/onofoodco/"
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
          <Text>No longer wish to receive these emails?</Text>
          <Text>please unsubscribe</Text>
          <MjmlSpacer height="10px" />
          <Text>Ono Food Co.</Text>
          <Text>915 Venice Blvd. Los Angeles, CA 90015</Text>
        </MjmlColumn>
      </MjmlSection>
    </React.Fragment>
  );
}

export default Footer;
