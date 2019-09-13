import React from 'react';
import {
  render,
  MjmlSection,
  MjmlColumn,
  MjmlTable,
  MjmlSpacer,
} from 'mjml-react';
import Layout from './components/Layout';
import Header from './components/Header';
import theme from './theme';
import formatCurrency from '../utils/formatCurrency';
import GenericFooter from './components/GenericFooter';

function getBodyHTML({
  orderName,
  orderId,
  displayItems,
  subTotal,
  total,
  tax,
  paymentMethod,
  cardPresentMeta,
}) {
  const emailTitle = `Order Receipt for ${orderName}`;
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
            <tr>
              <td>
                <img
                  src="https://onofood.co/img/CC_Visa.png"
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
                  **** {paymentMethod.cardNumber}
                </p>
              </td>
            </tr>
          </MjmlTable>
        </MjmlColumn>
      </MjmlSection>
      {/* {promoCode && <PromoCodeSection promoCode={promoCode} />} */}
      <GenericFooter />
      {cardPresentMeta && (
        <MjmlText>
          Application Name: {cardPresentMeta.application_preferred_name}, AID:{' '}
          {cardPresentMeta.dedicated_file_name}
        </MjmlText>
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
