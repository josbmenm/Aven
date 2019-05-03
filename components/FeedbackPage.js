import React from 'react';
import ShortBlockFormPage from '../components/ShortBlockFormPage';
import BlockForm from '../components/BlockForm';
import BlockFormInput from '../components/BlockFormInput';
import BlockFormTitle from '../components/BlockFormTitle';
import BlockFormMessage from '../components/BlockFormMessage';
import BlockFormRow from '../components/BlockFormRow';
import BlockFormButton from '../components/BlockFormButton';
import useFocus from '../navigation-hooks/useFocus';

export default function FeedbackPage({ onSubmit, hideBackButton, ...props }) {
  const [comment, setComment] = React.useState('');
  function handleSubmit() {
    onSubmit({ comment });
  }
  const inputRenderers = [
    inputProps => (
      <BlockFormRow>
        <BlockFormInput
          label={'additional comments..'}
          onValue={setComment}
          value={comment}
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
        <BlockFormMessage message="Feedback is a gift" />
        <BlockFormTitle message="Feedback is a gift" />
        {inputs}
        <BlockFormRow>
          <BlockFormButton title="submit" onPress={handleSubmit} />
        </BlockFormRow>
      </BlockForm>
    </ShortBlockFormPage>
  );
}

FeedbackPage.navigationOptions = ShortBlockFormPage.navigationOptions;
