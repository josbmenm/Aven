import React from 'react';
import ShortBlockFormPage from '../components/ShortBlockFormPage';
import BlockForm from '../components/BlockForm';
import BlockFormTitle from '../components/BlockFormTitle';
import BlockFormMessage from '../components/BlockFormMessage';
import BlockFormRow from '../components/BlockFormRow';
import BlockFormButton from '../components/BlockFormButton';
import CountdownDoneButton from './CountdownDoneButton';
import { Spacing } from '../ui-library/Theme';
import Stack from '../ui-library/layout/Stack';
import Button from '../ui-library/literals/Button';

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
        <Stack theme={{ spacing: 0 }}>
          <BlockFormMessage message="You're almost ready to go..." />
          <BlockFormTitle title="would you like a receipt?" />
          <Stack horizontal flex>
            <Button theme={{ fontSize: 24 }} title="via sms" onPress={onSms} />
            <Button
              theme={{ fontSize: 24 }}
              title="via email"
              onPress={onEmail}
            />
          </Stack>
        </Stack>
        <Spacing flex={false} top={16}>
          <Stack flex horizontal>
            <BlockFormButton title="no, thanks" onPress={onNoReceipt} />
          </Stack>
        </Spacing>
      </BlockForm>
      <CountdownDoneButton onPress={onComplete} duration={20} />
    </ShortBlockFormPage>
  );
}

ReceiptPage.navigationOptions = ShortBlockFormPage.navigationOptions;
