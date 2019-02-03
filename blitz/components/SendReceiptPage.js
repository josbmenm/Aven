import React, { useState } from 'react';
import { useNavigation } from '../../navigation-hooks/Hooks';
import BlockForm from './BlockForm';
import BlockFormMessage from './BlockFormMessage';
import BlockFormTitle from './BlockFormTitle';
import BlockFormRow from './BlockFormRow';
import BlockFormInput from './BlockFormInput';
import BlockFormButton from './BlockFormButton';
import ShortBlockFormPage from './ShortBlockFormPage';

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

  const title =
    type === 'sms'
      ? 'what is your phone number?'
      : 'what is your email address?';
  return (
    <ShortBlockFormPage backBehavior={backBehavior} {...props}>
      <BlockForm>
        <BlockFormMessage message="We just need to know..." />
        <BlockFormTitle title={title} />
        <BlockFormRow>
          <BlockFormInput
            label={type === 'sms' ? 'phone number' : 'email address'}
            mode={type === 'sms' ? 'phone' : 'email'}
            onValue={setValue}
            value={contactValue}
            onSubmit={() => {
              // todo, focus management..
            }}
          />
        </BlockFormRow>
        <BlockFormRow>
          <BlockFormButton title="send receipt" onPress={handleSubmit} />
        </BlockFormRow>
      </BlockForm>
    </ShortBlockFormPage>
  );
}

SendReceiptPage.navigationOptions = ShortBlockFormPage.navigationOptions;
