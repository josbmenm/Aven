import React from 'react';
import { log } from '../logger/logger';
import ThankyouEmail from '../emails/ThankyouEmail';

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

  await emailAgent.actions.SendEmailTemplate(ThankyouEmail, email, {
    promoCode,
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
