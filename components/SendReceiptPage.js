import React, { useState } from 'react';
import { View } from 'react-native';
import BlockForm from './BlockForm';
import BlockFormMessage from './BlockFormMessage';
import BlockFormTitle from './BlockFormTitle';
import BlockFormRow from './BlockFormRow';
import Spinner from './Spinner';
import BlockFormInput from './BlockFormInput';
import BlockFormButton from './BlockFormButton';
import ShortBlockFormPage from './ShortBlockFormPage';
import useFocus from '../navigation-hooks/useFocus';
import Stack from '../dash-ui/Stack';
import { Spacing } from '../dash-ui/Theme';
import Button from '../dash-ui/Button';

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
      <BlockForm style={{ flex: 1, justifyContent: 'center' }}>
        <BlockFormMessage message="We just need to know..." />
        {error && <BlockFormTitle title="Uh oh! Try again please." />}
        <BlockFormTitle title={title} />

        {inputs}
        <Spacing top={16} inline>
          <Button
            title={isProgressing ? '' : 'send receipt'}
            onPress={handleSubmit}
          >
            {isProgressing && (
              <Spinner color="white" style={{ alignSelf: 'center', top: 4 }} />
            )}
          </Button>
        </Spacing>
      </BlockForm>
    </ShortBlockFormPage>
  );
}

SendReceiptPage.navigationOptions = ShortBlockFormPage.navigationOptions;
