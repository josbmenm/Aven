import React from 'react';
import {
  render,
  Mjml,
  MjmlHead,
  MjmlTitle,
  MjmlPreview,
  MjmlBody,
  MjmlSection,
  MjmlColumn,
  MjmlButton,
} from 'mjml-react';
import Text from './components/Text';

function Header({ title, metaTitle }) {
  return (
    <MjmlHead>
      <mj-font
        name="MaaxBold"
        href="http://onofood.co/fonts/Maax%20-%20Bold-205TF/Maax%20-%20Bold-205TF.woff2"
      />
      <MjmlTitle>{title}</MjmlTitle>
      <MjmlPreview>{metaTitle}</MjmlPreview>
    </MjmlHead>
  );
}

function getBodyHTML(params) {
  const { html, errors } = render(
    <Mjml>
      <Header />
      <MjmlBody backgroundColor="#F8F8F8">
        <MjmlSection
          paddingLeft="66px"
          paddingRight="66px"
          paddingTop="20px"
          paddingBottom="80px"
          backgroundColor="white"
          borderBottom="1px solid #005151"
        >
          <MjmlColumn padding="0">
            <Text>THANK YOU</Text>
          </MjmlColumn>
        </MjmlSection>
        <MjmlSection
          backgroundColor="white"
          paddingTop="36px"
          paddingBottom="36px"
          paddingLeft="24px"
          paddingRight="24px"
        >
          <MjmlColumn>
            <Text
              fontSize="12px"
              font-Weight="bold"
              color="#005151"
              padding="0"
            >
              Give a Blend, Get a Blend.
            </Text>
            <Text padding="4px 0" fontSize="12px" color="#005151">
              For every friend who places their first order, you’ll get a free
              blend on your next visit.
            </Text>
          </MjmlColumn>
          <MjmlColumn>
            <Text align="right" padding="0" paddingBottom="4px">
              Share your promo code:
            </Text>
            <MjmlButton
              align="right"
              padding="0"
              innerPadding="10px 24px 13px 24px"
              fontSize="12px"
              backgroundColor="#eee"
              fontWeight="bold"
              color="#005151"
              borderRadius="3px"
            >
              STEPHENK573
            </MjmlButton>
          </MjmlColumn>
        </MjmlSection>
      </MjmlBody>
    </Mjml>,
    { validationLevel: 'soft' },
  );

  if (errors.length) {
    console.log('TCL: sendReceiptEmail -> errors', errors);
    console.error(errors);
    throw new Error('Cannot construct email!', errors);
  }
  return html;
}

function getBodyText(params) {
  return `Thanks for ordering from ono blends!

Your total is ${params.total}

Ono Blends`;
}

function getSubject(params) {
  return 'Your receipt from Ono Blends';
}

export default {
  getBodyHTML,
  getBodyText,
  getSubject,
};
