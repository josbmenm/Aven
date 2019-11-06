import React from 'react';
import ShortBlockFormPage from '../components/ShortBlockFormPage';
import BlockForm from '../components/BlockForm';
import BlockFormTitle from '../components/BlockFormTitle';
import BlockFormMessage from '../components/BlockFormMessage';
import BlockFormRow from '../components/BlockFormRow';
import BlockFormButton from '../components/BlockFormButton';
import CountdownDoneButton from './CountdownDoneButton';

export default function ReceiptPage({
  onSms,
  onEmail,
  onNoReceipt,
  onComplete,
  hideBackButton,
  ...props
}) {
  return (
    <ShortBlockFormPage hideBackButton={hideBackButton} {...props}>
      <BlockForm style={{ flex: 1, justifyContent: 'center' }}>
        <BlockFormMessage message="You're almost ready to go..." />
        <BlockFormTitle title="would you like a receipt?" />
        <BlockFormRow>
          <BlockFormButton title="via sms" onPress={onSms} />
          <BlockFormButton title="via email" onPress={onEmail} />
        </BlockFormRow>
        <BlockFormRow>
          <BlockFormButton title="no, thanks" onPress={onNoReceipt} />
        </BlockFormRow>
      </BlockForm>
      <CountdownDoneButton onPress={onComplete} duration={20} />
    </ShortBlockFormPage>
  );
}

ReceiptPage.navigationOptions = ShortBlockFormPage.navigationOptions;
