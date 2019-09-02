import React from 'react';
import { log } from '../logger/logger';
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
  MjmlImage,
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
const codeLetters = 'abcdefghjklmnpqrstuvwxyz0123456789';
const getLetter = () =>
  codeLetters[Math.floor(Math.random() * codeLetters.length)];
const getCode = () =>
  Array(5)
    .fill(0)
    .map(() => getLetter())
    .join('')
    .toUpperCase();

export default async function submitFeedback(
  cloud,
  emailAgent,
  { email, feedback },
) {
  log('CustomerFeedbackWillSubmit', { email, feedback });
  const promoCode = getCode();

  const { html, errors } = render(
    <Mjml>
      <Header
        title="Free blend from Ono Blends"
        metaTitle={`Your promo code is ${promoCode}`}
      />
      <MjmlBody width={500}>
        <MjmlSection fullWidth backgroundColor="#f7f7f7">
          <MjmlColumn>
            <MjmlImage src="https://onofood.co/img/icons.svg" />
          </MjmlColumn>
        </MjmlSection>
        <MjmlSection>
          <MjmlColumn>
            <MjmlButton
              padding="20px"
              backgroundColor="#346DB7"
              href="https://onofood.co"
            >
              sign up for updates from ono
            </MjmlButton>
          </MjmlColumn>
        </MjmlSection>
      </MjmlBody>
    </Mjml>,
    { validationLevel: 'soft' },
  );
  if (errors.length) {
    throw new Error('Cannot construct email!', errors);
  }
  await emailAgent.actions.SendEmail({
    to: email,
    subject: 'Free blend from Ono Blends',
    message: `Thanks for your feedback!

Your promo code is ${promoCode}


-The Ono Blends Team`,
    messageHTML: html,
  });

  const now = Date.now();
  const companyActivity = cloud.get('CompanyActivity');

  const result = await companyActivity.putTransactionValue({
    type: 'CustomerFeedback',
    feedback,
    email,
    promoCode,
    time: now,
  });
  await cloud.get(`PromoCodes/${promoCode}`).putValue({
    createdTime: now,
    type: 'FreeBlends',
    count: 1,
    promoCode: promoCode,
    context: {
      type: 'ThanksToken',
      tag: 'FeedbackKiosk',
      id: result.id,
    },
  });
  log('CustomerFeedbackDidSubmit', {
    email,
    feedback,
    promoCode,
    resultId: result.id,
  });

  return {};
}
