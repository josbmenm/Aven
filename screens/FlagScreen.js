import React from 'react';
import BlockForm from './BlockForm';
import BlockFormMessage from './BlockFormMessage';
import BlockFormRow from './BlockFormRow';
import BlockFormInput from './BlockFormInput';
import BlockFormButton from './BlockFormButton';
import ShortBlockFormPage from './ShortBlockFormPage';
import useFocus from '../navigation-hooks/useFocus';

function FlagPage({ backBehavior, ...props }) {
  const [inputA, setInputA] = React.useState('');
  const [inputB, setInputB] = React.useState('');

  const flagContext = props.navigation.getParam('context');

  function handleSubmit() {
    const flagOptions = {
      whatHappened: inputA,
      details: inputB,
      context: flagContext,
    };
    log('OperatorFlag', flagOptions);
    props.navigation.goBack();
  }

  const inputRenderers = [
    inputProps => (
      <BlockFormRow>
        <BlockFormInput
          label="what happened?"
          mode="description"
          maxLength={24}
          onValue={setInputA}
          value={inputA}
          {...inputProps}
        />
      </BlockFormRow>
    ),
    inputProps => (
      <BlockFormRow>
        <BlockFormInput
          label="any details?"
          mode="description"
          maxLength={1}
          onValue={setInputB}
          value={inputB}
          {...inputProps}
        />
      </BlockFormRow>
    ),
  ];
  const { inputs } = useFocus({
    onSubmit: handleSubmit,
    inputRenderers,
  });
  return (
    <ShortBlockFormPage backBehavior={backBehavior} {...props}>
      <BlockForm style={{ flex: 1, justifyContent: 'center' }}>
        <BlockFormMessage message="What's up?" />
        {inputs}
        <BlockFormRow>
          <BlockFormButton
            size="large"
            title={'submit'}
            onPress={handleSubmit}
          />
        </BlockFormRow>
      </BlockForm>
    </ShortBlockFormPage>
  );
}

FlagPage.navigationOptions = ShortBlockFormPage.navigationOptions;

export default function FlagScreen(props) {
  return <FlagPage {...props} />;
}

FlagScreen.navigationOptions = FlagPage.navigationOptions;