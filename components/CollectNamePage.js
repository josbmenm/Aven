import React, { useState } from 'react';
import BlockForm from './BlockForm';
import BlockFormMessage from './BlockFormMessage';
import BlockFormTitle from './BlockFormTitle';
import BlockFormRow from './BlockFormRow';
import BlockFormInput from './BlockFormInput';
import BlockFormButton from './BlockFormButton';
import ShortBlockFormPage from './ShortBlockFormPage';
import useFocus from '../views/useFocus';

export default function CollectNamePage({ onSubmit, backBehavior, ...props }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  function handleSubmit() {
    onSubmit({ firstName, lastName });
  }

  const inputRenderers = [
    inputProps => (
      <BlockFormInput
        label="first name"
        mode="name"
        onValue={setFirstName}
        value={firstName}
        {...inputProps}
      />
    ),
    inputProps => (
      <BlockFormInput
        label="last initial"
        mode="name"
        onValue={setLastName}
        value={lastName}
        {...inputProps}
      />
    ),
  ];
  const { inputs } = useFocus({
    onSubmit: handleSubmit,
    inputRenderers,
  });
  return (
    <ShortBlockFormPage backBehavior={backBehavior} {...props}>
      <BlockForm>
        <BlockFormMessage message="You're almost ready to go..." />
        <BlockFormTitle title="what's the name for the order?" />
        <BlockFormRow>{inputs}</BlockFormRow>
        <BlockFormRow>
          <BlockFormButton
            title="pay now"
            disabled={firstName === '' || lastName === ''}
            onPress={handleSubmit}
          />
        </BlockFormRow>
      </BlockForm>
    </ShortBlockFormPage>
  );
}

CollectNamePage.navigationOptions = ShortBlockFormPage.navigationOptions;
