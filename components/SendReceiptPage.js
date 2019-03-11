import React, { useState } from 'react';
import BlockForm from './BlockForm';
import BlockFormMessage from './BlockFormMessage';
import BlockFormTitle from './BlockFormTitle';
import BlockFormRow from './BlockFormRow';
import BlockFormInput from './BlockFormInput';
import BlockFormButton from './BlockFormButton';
import ShortBlockFormPage from './ShortBlockFormPage';
import useFocus from '../navigation-hooks/useFocus';

// function FocusProvider() {

// }

// function useFocus() {
//   return {}
// }

export default function SendReceiptPage({
  onSubmit,
  backBehavior,
  type,
  ...props
}) {
  const [contactValue, setValue] = useState(null);
  const [lastName, setLastName] = useState(null);

  function handleSubmit() {
    onSubmit({ contactValue, lastName });
  }

  const inputRenderers = [
    inputProps => (
      <BlockFormInput
        label={type === 'sms' ? 'phone number' : 'email address'}
        mode={type === 'sms' ? 'phone' : 'email'}
        onValue={setValue}
        value={contactValue}
        {...inputProps}
      />
    ),
  ];
  const { inputs } = useFocus({
    onSubmit: handleSubmit,
    inputRenderers,
  });

  const title =
    type === 'sms'
      ? 'what is your phone number?'
      : 'what is your email address?';
  return (
    <ShortBlockFormPage backBehavior={backBehavior} {...props}>
      <BlockForm>
        <BlockFormMessage message="We just need to know..." />
        <BlockFormTitle title={title} />
        <BlockFormRow>{inputs}</BlockFormRow>
        <BlockFormRow>
          <BlockFormButton title="send receipt" onPress={handleSubmit} />
        </BlockFormRow>
      </BlockForm>
    </ShortBlockFormPage>
  );
}

SendReceiptPage.navigationOptions = ShortBlockFormPage.navigationOptions;
