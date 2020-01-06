import React from 'react';
import ShortBlockFormPage from '../components/ShortBlockFormPage';
import BlockForm from '../components/BlockForm';
import BlockFormInput from '../components/BlockFormInput';
import BlockFormTitle from '../components/BlockFormTitle';
import BlockFormMessage from '../components/BlockFormMessage';
import useFocus from '../navigation-hooks/useFocus';
import { Spacing, SpinnerButton } from '../dash-ui';

export default function FeedbackReceiptPage({
  onSubmit,
  hideBackButton,
  ...props
}) {
  const [email, setEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  function handleSubmit() {
    setIsLoading(true);
    onSubmit(email)
      .then(() => {
        setIsLoading(false);
      })
      .catch(e => {
        setIsLoading(false);
        setError(e);
      });
  }
  const inputRenderers = [
    inputProps => (
      <BlockFormInput
        label={'email'}
        mode="email"
        onValue={setEmail}
        value={email}
        {...inputProps}
      />
    ),
  ];
  const { inputs } = useFocus({
    onSubmit: handleSubmit,
    inputRenderers,
  });
  return (
    <ShortBlockFormPage hideBackButton={hideBackButton} {...props}>
      <BlockForm style={{ flex: 1, justifyContent: 'center' }}>
        <BlockFormMessage message="we promise not to spam you, but what's" />
        <BlockFormTitle title="your email for the free blend?" />
        {inputs}
        <Spacing top={16}>
          <SpinnerButton
            title={isLoading ? '' : 'send my free blend code'}
            onPress={handleSubmit}
            isLoading={isLoading}
          />
        </Spacing>
      </BlockForm>
    </ShortBlockFormPage>
  );
}

FeedbackReceiptPage.navigationOptions = ShortBlockFormPage.navigationOptions;
