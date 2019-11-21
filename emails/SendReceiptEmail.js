import React from 'react';
import {
  render,
  MjmlSection,
  MjmlColumn,
  MjmlTable,
  MjmlSpacer,
  MjmlText,
} from 'mjml-react';
import Layout from './components/Layout';
import Header from './components/Header';
import theme from './theme';
import formatCurrency from '../utils/formatCurrency';
import GenericFooter from './components/GenericFooter';

function getSubject(params) {
  return `Order Receipt for ${params.orderName}`;
}

const CARD_IMAGES = {
  amex: 'https://onofood.co/img/CC_AmericanExpress.png',
  diners: 'https://onofood.co/img/CC_DinersClub.png',
  discover: 'https://onofood.co/img/CC_Discover.png',
  interac: 'https://onofood.co/img/CC_Visa.png', // todo, fix me
  jcb: 'https://onofood.co/img/CC_JCB.png',
  mastercard: 'https://onofood.co/img/CC_MasterCard.png', // todo, fix me
  unionpay: 'https://onofood.co/img/CC_UnionPay.png',
  visa: 'https://onofood.co/img/CC_Visa.png',
  unknown: 'https://onofood.co/img/CC_Visa.png', // todo, fix me
};

function getBodyHTML(params) {
  const {
    orderName,
    orderId,
    displayItems,
    subTotal,
    total,
    tax,
    cardLast4,
    cardBrand,
    cardPresentMeta,
  } = params;
  const emailTitle = getSubject(params);
  const { html, errors } = render(
    <Layout title={emailTitle} metaTitle="We hope you enjoyed Ono Blends">
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
        paddingTop="20px"
        paddingBottom="80px"
        backgroundColor="white"
        borderBottom="1px solid #005151"
      >
        <MjmlColumn padding="0">
          <MjmlTable padding="0">
            <tr style={{ border: 'none', borderCollapse: 'collapse' }}>
              <th align="left">
                <p
                  style={{ ...theme.textStyles.heading, margin: 0, padding: 0 }}
                >
                  total
                </p>
              </th>
              <th align="right">
                <p
                  style={{
                    ...theme.textStyles.heading,
                    margin: 0,
                    padding: 0,
                    textAlign: 'right',
                  }}
                >
                  {formatCurrency(total.amount)}
                </p>
              </th>
            </tr>
          </MjmlTable>
          <MjmlSpacer height="40px" />
          <MjmlTable padding="0">
            {displayItems.map((item, idx) => (
              <tr>
                <td>
                  <p
                    style={{ ...theme.textStyles.body, margin: 0, padding: 0 }}
                  >{`${idx + 1}. ${item.label}`}</p>
                </td>
                <td>
                  <p
                    style={{
                      ...theme.textStyles.body,
                      margin: 0,
                      padding: 0,
                      textAlign: 'right',
                    }}
                  >
                    {formatCurrency(item.amount)}
                  </p>
                </td>
              </tr>
            ))}
          </MjmlTable>
          <MjmlSpacer height="80px" />
          <MjmlTable padding="0">
            <tr>
              <td>
                <p style={{ ...theme.textStyles.body, margin: 0, padding: 0 }}>
                  {subTotal.label}
                </p>
              </td>
              <td>
                <p
                  style={{
                    ...theme.textStyles.body,
                    textAlign: 'right',
                    margin: 0,
                    padding: 0,
                  }}
                >
                  {formatCurrency(subTotal.amount)}
                </p>
              </td>
            </tr>
            <tr>
              <td>
                <p style={{ ...theme.textStyles.body, margin: 0, padding: 0 }}>
                  {tax.label}
                </p>
              </td>
              <td>
                <p
                  style={{
                    ...theme.textStyles.body,
                    textAlign: 'right',
                    margin: 0,
                    padding: 0,
                  }}
                >
                  {formatCurrency(tax.amount)}
                </p>
              </td>
            </tr>
          </MjmlTable>
          <MjmlSpacer height="42px" />
          <MjmlTable padding="0">
            <tr>
              <td>
                <p style={{ ...theme.textStyles.body, margin: 0, padding: 0 }}>
                  {total.label}
                </p>
              </td>
              <td>
                <p
                  style={{
                    ...theme.textStyles.body,
                    margin: 0,
                    padding: 0,
                    textAlign: 'right',
                  }}
                >
                  {formatCurrency(total.amount)}
                </p>
              </td>
            </tr>
            {cardBrand && cardLast4 && (
              <tr>
                <td>
                  <img
                    src={CARD_IMAGES[cardBrand] || CARD_IMAGES.unknown}
                    width="30px"
                    height="21px"
                  />
                  <p
                    style={{
                      ...theme.textStyles.body,
                      margin: 0,
                      padding: 0,
                      marginLeft: 24,
                      display: 'inline-block',
                    }}
                  >
                    {cardBrand.toUpperCase()} ****{cardLast4}
                  </p>
                </td>
              </tr>
            )}
          </MjmlTable>
        </MjmlColumn>
      </MjmlSection>
      {/* {promoCode && <PromoCodeSection promoCode={promoCode} />} */}
      <GenericFooter />

      {cardPresentMeta && (
        <MjmlSection>
          <MjmlColumn>
            <MjmlText
              {...theme.textStyles.small}
              align="center"
              color={theme.colors.secondary}
            >
              {cardPresentMeta}
            </MjmlText>
          </MjmlColumn>
        </MjmlSection>
      )}
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
  const {
    orderName,
    orderId,
    displayItems,
    subTotal,
    total,
    tax,
    cardLast4,
    cardBrand,
    cardPresentMeta,
  } = params;
  return `Thanks for ordering from Ono Blends!

${displayItems.map(
  (item, idx) =>
    `${idx + 1}. ${item.label} - ${formatCurrency(item.amount)}
`,
)}

Tax: ${formatCurrency(tax.amount)}
Total: ${formatCurrency(total.amount)}

${cardBrand && cardLast4 && `${cardBrand.toUpperCase()} ****${cardLast4}`}

- Ono Blends

${cardPresentMeta}

Questions?
Contact us at lucy@onofood.co

Ono Food Co.
915 Venice Blvd. Los Angeles, CA 90015

`;
}

export default {
  getBodyHTML,
  getBodyText,
  getSubject,
};
