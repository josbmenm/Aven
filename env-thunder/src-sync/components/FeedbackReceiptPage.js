import React from 'react';
import ShortBlockFormPage from '../components/ShortBlockFormPage';
import BlockForm from '../components/BlockForm';
import BlockFormInput from '../components/BlockFormInput';
import BlockFormTitle from '../components/BlockFormTitle';
import BlockFormMessage from '../components/BlockFormMessage';
import BlockFormRow from '../components/BlockFormRow';
import BlockFormButton from '../components/BlockFormButton';
import useFocus from '../navigation-hooks/useFocus';

export default function FeedbackReceiptPage({
  onSubmit,
  hideBackButton,
  ...props
}) {
  const [email, setEmail] = React.useState('');
  function handleSubmit() {
    onSubmit({ email });
  }
  const inputRenderers = [
    inputProps => (
      <BlockFormRow>
        <BlockFormInput
          label={'email'}
          mode="email"
          onValue={setEmail}
          value={email}
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
    <ShortBlockFormPage hideBackButton={hideBackButton} {...props}>
      <BlockForm>
        <BlockFormMessage message="Email please" />
        <BlockFormTitle message="free blend on the way" />
        {inputs}
        <BlockFormRow>
          <BlockFormButton title="submit" onPress={handleSubmit} />
        </BlockFormRow>
      </BlockForm>
    </ShortBlockFormPage>
  );
}

FeedbackReceiptPage.navigationOptions = ShortBlockFormPage.navigationOptions;
