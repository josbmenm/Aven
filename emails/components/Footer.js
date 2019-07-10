import React from 'react'

import {
  MjmlSection,
  MjmlColumn,
  MjmlButton,
  MjmlImage,
  MjmlSpacer,
  MjmlText,
} from 'mjml-react';

function Footer() {
  return (
    <MjmlSection>
      <MjmlColumn>
        <MjmlText fontSize="24px" fontWeight="bold">Footer content</MjmlText>
      </MjmlColumn>
    </MjmlSection>
  )
}

export default Footer;
