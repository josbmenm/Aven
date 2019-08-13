import React, { useState } from 'react';
import BlockForm from './BlockForm';
import BlockFormMessage from './BlockFormMessage';
import BlockFormTitle from './BlockFormTitle';
import BlockFormRow from './BlockFormRow';
import BlockFormInput from './BlockFormInput';
import BlockFormButton from './BlockFormButton';
import ShortBlockFormPage from './ShortBlockFormPage';
import useFocus from '../navigation-hooks/useFocus';

export default function SendReceiptPage({
  onSubmit,
  backBehavior,
  isProgressing,
  error,
  type, // sms || email
  ...props
}) {
  const [inputValue, setValue] = useState(null);

  function handleSubmit() {
    let value = inputValue;
    if (type === 'sms' && inputValue.match(/\d/g)) {
      value = '1' + inputValue.match(/\d/g).join('');
    }
    onSubmit({ value, type });
  }

  const inputRenderers = [
    inputProps => (
      <BlockFormInput
        label={type === 'sms' ? 'phone number' : 'email address'}
        mode={type === 'sms' ? 'phone' : 'email'}
        onValue={setValue}
        value={inputValue}
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
      <BlockForm style={{flex: 1, justifyContent: 'center'}}>
        <BlockFormMessage message="We just need to know..." />
        {error && <BlockFormTitle title="Uh oh! Try again please." />}
        {isProgressing && <BlockFormTitle title="wait for it" />}
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