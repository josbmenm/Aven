import React from 'react';
import { render, MjmlSection, MjmlColumn, MjmlSpacer } from 'mjml-react';
import Layout from './components/Layout';
import Text from './components/Text';
import Header from './components/Header';
import SocialFooter from './components/SocialFooter';
import theme from './theme';
import formatCurrency from '../utils/formatCurrency'

function getBodyHTML({ refund }) {
  const { html, errors } = render(
    <Layout title="Thank you" metaTitle="ONO food - Thank you">
      <Header />
      <MjmlSection
        padding="0px"
        backgroundColor="white"
        borderBottom={`1px solid ${theme.colors.primary}`}
        textAlign="center"
      >
        <MjmlColumn padding="80px 20px">
          <Text
            variant="heading"
            align="center"
            padding="0px"
          >{`A refund of ${
            formatCurrency(refund)
          } has been issued to your credit card.`}</Text>
          <MjmlSpacer height="24px" />
          <Text align="center">
            While this refund is immediate on our part, it can take up to five
            business days for the refund to be reflected in your account.
          </Text>
        </MjmlColumn>
      </MjmlSection>
      <SocialFooter />
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
  return `Refund Complete on your order from Ono Blends

Ono Blends`;
}

function getSubject(params) {
  return 'Refund Complete from Ono Blends';
}

export default {
  getBodyHTML,
  getBodyText,
  getSubject,
};
