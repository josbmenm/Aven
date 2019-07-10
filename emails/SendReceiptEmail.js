import React from 'react';
import {
  render,
  MjmlSection,
  MjmlColumn,
  MjmlTable,
  MjmlSpacer,
  MjmlText,
} from 'mjml-react';
import Footer from './components/Footer';
import Layout from './components/Layout';
import Header from './components/Header';
import PromoCodeSection from './components/PromoCodeSection';
import theme from './theme';

function renderCurrency(amount) {
  // TODO: check the currency and render the appropiate symbol
  return `$${amount.value}`;
}

function getBodyHTML({ orderDetails, promocode }) {
  const { displayItems, subTotal, total, tax, paymentMethod } = orderDetails;
  const { html, errors } = render(
    <Layout title="Receipt email" metaTitle="ONO food - Blend Receipt">
      <Header />
      <MjmlSection
        backgroundUrl={'https://via.placeholder.com/1200x900'}
        backgroundSize="cover"
        backgroundRepeat="no-repeat"
      >
        <MjmlColumn>
          <mj-spacer height="410px" />
        </MjmlColumn>
      </MjmlSection>
      <MjmlSection
        paddingLeft="66px"
        paddingRight="66px"
        paddingTop="20px"
        paddingBottom="80px"
        backgroundColor="white"
        borderBottom="1px solid #005151"
      >
        <MjmlColumn padding="0">
          <MjmlTable padding="0">
            <tr style={{ border: 'none', borderCollapse: 'collapse' }}>
              <th align="left">
                <MjmlText
                  fontFamily="MaaxBold"
                  textAlign="left"
                  color={theme.colors.primary}
                  fontSize="38px"
                  lineHeight="48px"
                  letterSpacing="0.5"
                >
                  <h2>total</h2>
                </MjmlText>
              </th>
              <th align="right">
                <MjmlText
                  fontFamily="MaaxBold"
                  textAlign="left"
                  color={theme.colors.primary}
                  fontSize="38px"
                  lineHeight="48px"
                  letterSpacing="0.5"
                >
                  <h2>{renderCurrency(total.amount)}</h2>
                </MjmlText>
              </th>
            </tr>
          </MjmlTable>
          <MjmlSpacer height="40px" />
          <MjmlTable padding="0">
            {displayItems.map((item, idx) => (
              <tr>
                <td
                  style={{
                    fontFamily: 'serif',
                    color: '#005151',
                    fontSize: '18px',
                    lineHeight: '32px',
                  }}
                >
                  {`${idx + 1}. ${item.label}`}
                </td>
                <td
                  style={{
                    textAlign: 'right',
                    fontFamily: 'serif',
                    color: '#005151',
                    fontSize: '18px',
                    lineHeight: '32px',
                  }}
                >
                  {renderCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </MjmlTable>
          <MjmlSpacer height="80px" />
          <MjmlTable padding="0">
            <tr>
              <td
                style={{
                  //font-family:serif;color:#005151;font-size:18px;line-height:28px;
                  fontFamily: 'serif',
                  color: '#005151',
                  fontSize: '18px',
                  lineHeight: '28px',
                }}
              >
                {subTotal.label}
              </td>
              <td
                style={{
                  fontFamily: 'serif',
                  color: '#005151',
                  fontSize: '18px',
                  lineHeight: '28px',
                  textAlign: 'right',
                }}
              >
                {renderCurrency(subTotal.amount)}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  fontFamily: 'serif',
                  color: '#005151',
                  fontSize: '18px',
                  lineHeight: '28px',
                }}
              >
                {tax.label}
              </td>
              <td
                style={{
                  fontFamily: 'serif',
                  color: '#005151',
                  fontSize: '18px',
                  lineHeight: '28px',
                  textAlign: 'right',
                }}
              >
                {renderCurrency(tax.amount)}
              </td>
            </tr>
          </MjmlTable>
          <MjmlSpacer height="42px" />
          <MjmlTable padding="0">
            <tr>
              <td
                style={{
                  //font-family:serif;color:#005151;font-size:18px;line-height:28px;
                  fontFamily: 'serif',
                  color: '#005151',
                  fontSize: '18px',
                  lineHeight: '28px',
                }}
              >
                {total.label}
              </td>
              <td
                style={{
                  fontFamily: 'serif',
                  color: '#005151',
                  fontSize: '18px',
                  lineHeight: '28px',
                  textAlign: 'right',
                }}
              >
                {renderCurrency(total.amount)}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  fontFamily: 'serif',
                  color: '#005151',
                  fontSize: '18px',
                  lineHeight: '28px',
                }}
              >
                {paymentMethod.cardNumber}
              </td>
            </tr>
          </MjmlTable>
        </MjmlColumn>
      </MjmlSection>
      {promocode && <PromoCodeSection promocode={promocode} />}
      <Footer />
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
