import React from 'react';
import { MjmlSection, MjmlColumn, MjmlButton } from 'mjml-react';
import theme from '../theme';
import Text from './Text';

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
        <Text {...theme.textStyles.small} fontWeight="bold">
          Give a Blend, Get a Blend.
        </Text>
        <Text {...theme.textStyles.small}>
          For every friend who places their first order, you’ll get a free blend
          on your next visit.
        </Text>
      </MjmlColumn>
      <MjmlColumn padding="0px">
        <Text {...theme.textStyles.small} align="right" paddingBottom="4px">
          Share your promo code:
        </Text>
        <MjmlButton
          href="#"
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
