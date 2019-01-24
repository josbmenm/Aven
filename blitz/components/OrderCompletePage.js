import React, { useState } from 'react';
import ShortBlockFormPage from '../components/ShortBlockFormPage';
import BlockForm from '../components/BlockForm';
import BlockFormTitle from '../components/BlockFormTitle';
import BlockFormMessage from '../components/BlockFormMessage';
import BlockFormRow from '../components/BlockFormRow';
import BlockFormButton from '../components/BlockFormButton';
import BlockFormInput from '../components/BlockFormInput';
import BlockFormHorizontalRule from '../components/BlockFormHorizontalRule';

export default function OrderCompletePage({ backBehavior, ...props }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  return (
    <ShortBlockFormPage backBehavior={backBehavior} {...props}>
      <BlockForm>
        <BlockFormMessage message="Your order is on its way!" />
        <BlockFormTitle title="mahalo! enjoy your blend." />
        <BlockFormHorizontalRule />
        <BlockFormMessage message="Next time, skip the line and order ahead with our mobile app" />
        <BlockFormRow>
          <BlockFormInput
            label="phone number"
            value={phoneNumber}
            onValue={setPhoneNumber}
          />
        </BlockFormRow>
        <BlockFormRow>
          <BlockFormButton title="text me a link" onPress={() => {}} />
        </BlockFormRow>
      </BlockForm>
    </ShortBlockFormPage>
  );
}

OrderCompletePage.navigationOptions = ShortBlockFormPage.navigationOptions;
