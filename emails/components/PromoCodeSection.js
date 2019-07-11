import React from 'react';

import { MjmlSection, MjmlColumn, MjmlButton } from 'mjml-react';
import Text from './Text'

function PromoCodeSection({ promocode }) {
  return (
    <MjmlSection
      backgroundColor="white"
      paddingTop="36px"
      paddingBottom="36px"
      paddingLeft="24px"
      paddingRight="24px"
    >
      <MjmlColumn>
        <Text
          fontSize="12px"
          font-Weight="bold"
          color="#005151"
          padding="0"
        >
          Give a Blend, Get a Blend.
        </Text>
        <Text padding="4px 0" fontSize="12px" color="#005151">
          For every friend who places their first order, you’ll get a free blend
          on your next visit.
        </Text>
      </MjmlColumn>
      <MjmlColumn>
        <Text align="right" padding="0" paddingBottom="4px">
          Share your promo code:
        </Text>
        <MjmlButton
          align="right"
          padding="0"
          innerPadding="10px 24px 13px 24px"
          fontSize="12px"
          backgroundColor="#eee"
          fontWeight="bold"
          color="#005151"
          borderRadius="3px"
          fontFamily="Maax-Bold"
        >
          {promocode}
        </MjmlButton>
      </MjmlColumn>
    </MjmlSection>
  );
}

export default PromoCodeSection;
