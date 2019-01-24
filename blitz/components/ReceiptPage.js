import React from 'react';
import ShortBlockFormPage from '../components/ShortBlockFormPage';
import BlockForm from '../components/BlockForm';
import BlockFormTitle from '../components/BlockFormTitle';
import BlockFormMessage from '../components/BlockFormMessage';
import BlockFormRow from '../components/BlockFormRow';
import BlockFormButton from '../components/BlockFormButton';

export default function ReceiptPage({
  onSms,
  onEmail,
  onNoReceipt,
  backBehavior,
  ...props
}) {
  return (
    <ShortBlockFormPage backBehavior={backBehavior} {...props}>
      <BlockForm>
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
    </ShortBlockFormPage>
  );
}

ReceiptPage.navigationOptions = ShortBlockFormPage.navigationOptions;
