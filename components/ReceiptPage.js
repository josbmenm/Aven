import React from 'react';
import { View } from 'react-native';
import ShortBlockFormPage from '../components/ShortBlockFormPage';
import BlockForm from '../components/BlockForm';
import BlockFormTitle from '../components/BlockFormTitle';
import BlockFormMessage from '../components/BlockFormMessage';
import BlockFormRow from '../components/BlockFormRow';
import BlockFormButton from '../components/BlockFormButton';
import CountdownDoneButton from './CountdownDoneButton';
import { Spacing } from '../dash-ui/Theme';
import Stack from '../dash-ui/Stack';
import Button from '../dash-ui/Button';

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
        <Spacing top={16}>
          <View style={{ flexDirection: 'row' }}>
            <Spacing value={8} inline={false}>
              <Button title="via sms" onPress={onSms} />
            </Spacing>
            <Spacing value={8} inline={false}>
              <Button title="via email" onPress={onEmail} />
            </Spacing>
          </View>
        </Spacing>
        <Spacing top={8} horizontal={8}>
          <Button title="no, thanks" onPress={onNoReceipt} />
        </Spacing>
      </BlockForm>
      <CountdownDoneButton onPress={onComplete} duration={20} />
    </ShortBlockFormPage>
  );
}

ReceiptPage.navigationOptions = ShortBlockFormPage.navigationOptions;
