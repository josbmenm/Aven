import React, { useState } from 'react';
import BlockForm from './BlockForm';
import BlockFormMessage from './BlockFormMessage';
import BlockFormTitle from './BlockFormTitle';
import BlockFormRow from './BlockFormRow';
import BlockFormInput from './BlockFormInput';
import ShortBlockFormPage from './ShortBlockFormPage';
import useFocus from '../navigation-hooks/useFocus';
import { SpinnerButton } from '../dash-ui';

export default function CollectNamePage({
  onSubmit,
  onChangeName = () => {},
  backBehavior,
  initialName = {},
  isCateringMode,
  ...props
}) {
  const [firstName, setFirstName] = useState(initialName.firstName || '');
  const [lastName, setLastName] = useState(initialName.lastName || '');

  function handleSubmit() {
    const finalResult = { firstName, lastName };
    onChangeName(finalResult);
    onSubmit(finalResult);
  }

  React.useEffect(() => {
    onChangeName({ firstName, lastName });
    // we are doing this asyncronously because the submit button handles the sync saving, and saving the name in the background is less important than the core form experience
  }, [firstName, lastName]);

  const inputRenderers = [
    inputProps => (
      <BlockFormInput
        label="first name"
        mode="name"
        maxLength={24}
        onValue={setFirstName}
        value={firstName}
        {...inputProps}
      />
    ),
    inputProps => (
      <BlockFormInput
        label="last initial"
        mode="name"
        maxLength={1}
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
      <BlockForm style={{ flex: 1, justifyContent: 'center' }}>
        <BlockFormMessage message="You're almost ready to go..." />
        <BlockFormTitle title="what's the name for the order?" />
        <BlockFormRow>{inputs}</BlockFormRow>
        <BlockFormRow>
          <SpinnerButton
            size="large"
            title={isCateringMode ? 'confirm order' : 'pay now'}
            disabled={firstName === '' || lastName === ''}
            onPress={handleSubmit}
          />
        </BlockFormRow>
      </BlockForm>
    </ShortBlockFormPage>
  );
}

CollectNamePage.navigationOptions = ShortBlockFormPage.navigationOptions;
