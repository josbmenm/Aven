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
  MjmlTable,
  MjmlButton,
  MjmlImage,
  MjmlSpacer,
  MjmlText,
} from 'mjml-react';

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

export const sendReceiptEmail = async () => {
  const { html, errors } = render(
    <Mjml>
      <Header />
      <MjmlBody backgroundColor="#F8F8F8">
        <MjmlSection
          backgroundColor="white"
          padding="0"
          borderBottom="1px solid #005151"
        >
          <MjmlColumn />
          <MjmlColumn padding="0">
            <MjmlImage
              fluidOnMobile="true"
              width="150px"
              src="./assets/email_logo.png"
            />
          </MjmlColumn>
          <MjmlColumn />
        </MjmlSection>
        <MjmlSection
          backgroundUrl="./assets/blend_pic.jpg"
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
                <th>
                  <h2
                    style={{
                      //"color:#005151;margin:0;pading:0;font-size:38px;line-height:48px;text-align:left;"
                      color: '#005151',
                      margin: '0',
                      padding: '0',
                      fontSize: '38px',
                      lineHeight: '48px',
                      textAlign: 'left',
                    }}
                  >
                    Total:
                  </h2>
                </th>
                <th>
                  <h2
                    style={{
                      color: '#005151',
                      margin: '0',
                      padding: '0',
                      fontSize: '38px',
                      lineHeight: '48px',
                      textAlign: 'right',
                    }}
                  >
                    $6.50
                  </h2>
                </th>
              </tr>
            </MjmlTable>
            <MjmlSpacer height="40px" />
            <MjmlTable padding="0">
              <tr>
                <td
                  style={{
                    //font-family:serif;color:#005151;font-size:18px;line-height:"28px"px;
                    fontFamily: 'serif',
                    color: '#005151',
                    fontSize: '18px',
                    lineHeight: '28px',
                  }}
                >
                  1. Avocado + Matcha
                </td>
                <td
                  style={{
                    // text-align:right;font-family:serif;color:#005151;font-size:18px;line-height:28px;
                    textAlign: 'right',
                    fontFamily: 'serif',
                    color: '#005151',
                    fontSize: '18px',
                    lineHeight: '28px',
                  }}
                >
                  $5.95
                </td>
              </tr>
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
                  Subtotal
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
                  $5.95
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
                  Tax
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
                  $0.55
                </td>
              </tr>
            </MjmlTable>
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
            <MjmlText
              fontSize="12px"
              font-Weight="bold"
              color="#005151"
              padding="0"
            >
              Give a Blend, Get a Blend.
            </MjmlText>
            <MjmlText padding="4px 0" fontSize="12px" color="#005151">
              For every friend who places their first order, you’ll get a free
              blend on your next visit.
            </MjmlText>
          </MjmlColumn>
          <MjmlColumn>
            <MjmlText align="right" padding="0" paddingBottom="4px">
              Share your promo code:
            </MjmlText>
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
};
