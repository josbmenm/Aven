import React from 'react';
import {
  render,
  MjmlSection,
  MjmlColumn,
  MjmlButton,
  MjmlImage,
  MjmlSpacer,
} from 'mjml-react';
import Layout from './components/Layout';
import Text from './components/Text';
import Header from './components/Header';
import GenericFooter from './components/GenericFooter';
import theme from './theme';

function getSubject() {
  return 'Thanks for the feedback!';
}

function getBodyHTML({ promoCode }) {
  const { html, errors } = render(
    <Layout
      title="As a token of our appreciation,"
      metaTitle={`Your free blend code is ${promoCode}`}
    >
      <Header />
      <MjmlSection
        padding="0px"
        backgroundUrl="https://onofood.co/img/blend_thankyou.jpg"
        backgroundSize="cover"
        backgroundRepeat="no-repeat"
      >
        <MjmlColumn padding="0px">
          <MjmlSpacer height="410px" />
        </MjmlColumn>
      </MjmlSection>
      <MjmlSection
        paddingLeft="66px"
        paddingRight="66px"
        backgroundColor="white"
      >
        <MjmlColumn padding="0">
          <MjmlImage
            src="https://onofood.co/img/thankyou_title.png"
            width="205px"
            paddingTop="32px"
            paddingBottom="16px"
          />
          <Text variant="body">
            We appreciate the feedback. As a token of our appreciation, we want
            to give you&nbsp;
            <span style={{ textDecoration: 'line-through' }}>food</span> a blend
            for thought.
          </Text>
          <Text variant="body">
            Next time you order, use the promo code below to redeem a free
            blend.
          </Text>
        </MjmlColumn>
      </MjmlSection>
      <MjmlSection
        padding="0px"
        backgroundColor="white"
        padding="48px 0 100px 0"
        textAlign="center"
        borderBottom="1px solid #005151"
      >
        <MjmlColumn padding="0px">
          <Text variant="body" align="center">
            Use promo code:
          </Text>
          <MjmlButton
            align="center"
            padding="10px 0px"
            innerPadding="28px 24px"
            fontSize="28px"
            fontFamily="Maax-Bold"
            backgroundColor="#eee"
            fontWeight="bold"
            color={theme.colors.primary}
            borderRadius="3px"
            fontFamily="Maax-Bold"
          >
            {promoCode}
          </MjmlButton>
        </MjmlColumn>
      </MjmlSection>
      <GenericFooter />
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

function getBodyText({ promoCode }) {
  return `We appreciate the feedback. As a token of our appreciation, we want to give you a blend for thought.

Next time you order, use the promo code below to redeem a free blend.

${promoCode}

-Ono Blends

Questions?
Contact us at lucy@onofood.co
`;
}

export default {
  getBodyHTML,
  getBodyText,
  getSubject,
};
