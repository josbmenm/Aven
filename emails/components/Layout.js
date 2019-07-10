import React from 'react';
import {
  MjmlHead,
  Mjml,
  MjmlTitle,
  MjmlFont,
  MjmlPreview,
  MjmlBody,
  MjmlWrapper,
} from 'mjml-react';
import theme from '../theme';

function Head({ title, metaTitle }) {
  return (
    <MjmlHead>
      <MjmlFont
        name="Maax-Bold"
        href="http://onofood.co/fonts/Maax%20-%20Bold-205TF/Maax%20-%20Bold-205TF.woff2"
      />
      <MjmlTitle>{title}</MjmlTitle>
      <MjmlPreview>{metaTitle}</MjmlPreview>
    </MjmlHead>
  );
}

function Layout({
  children,
  title,
  metaTitle,
  backgroundColor = theme.colors.background,
}) {
  return (
      <Mjml>
        <Head title={title} metaTitle={metaTitle} />
        <MjmlBody backgroundColor={backgroundColor}>
          <MjmlWrapper padding="24px 0">{children}</MjmlWrapper>
        </MjmlBody>
      </Mjml>
  );
}

export default Layout;
