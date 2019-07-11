import React from 'react';
import {
  render,
  MjmlRaw,
  MjmlSection,
  MjmlColumn,
  MjmlButton,
  MjmlImage
} from 'mjml-react';
import theme from './theme';
import Layout from './components/Layout';
import Text from './components/Text';
import Header from './components/Header';

function getBodyHTML(params) {
  const { html, errors } = render(
    <Layout>
      <Header />
      <MjmlSection
      padding="0px"
        backgroundUrl="https://emailassets-kglyyrazbw.now.sh/blend_thankyou.jpg"
        backgroundSize="cover"
        backgroundRepeat="no-repeat"
      >
        <MjmlColumn padding="0px">
          <mj-spacer height="410px" />
        </MjmlColumn>
      </MjmlSection>
      <MjmlSection
        paddingLeft="66px"
        paddingRight="66px"
        backgroundColor="white"
        borderBottom="1px solid #005151"
      >
        <MjmlColumn padding="0">
          <MjmlImage src="https://emailassets-kglyyrazbw.now.sh/thankyou_title.png"
                width="205px" paddingTop="32px" paddingBottom="16px" />
          <Text fontSize="18px" lineHeight="28px" color={theme.colors.primary}>
          <p>We appreciate the feedback. As a token of our appreciation, we want to give you food a blend for thought. </p>
          </Text>
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
          <Text fontSize="12px" font-Weight="bold" color="#005151" padding="0">
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
    </Layout>,
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
