import React from 'react';
import { AlertIOS } from 'react-native';
import Hero from '../../components/Hero';

import GenericPage from '../components/GenericPage';
import RowSection from '../../components/RowSection';
import LinkRow from '../../components/LinkRow';
import { paymentContainer } from '../Payments';
import useCloud from '../../aven-cloud/useCloud';
import useKioskName from '../useKioskName';

function UpdateAirtableRow() {
  const cloud = useCloud();
  return (
    <LinkRow
      onPress={() => {
        cloud
          .dispatch({ type: 'UpdateAirtable' })
          .then(() => {
            alert('Airtable Updated!');
          })
          .catch(e => {
            console.error(e);
            alert('Error updating Airtable!');
          });
      }}
      icon="♻️"
      title="Update Airtable"
    />
  );
}

const PaySettingsRow = paymentContainer(({ openSettings }) => (
  <LinkRow
    onPress={() => {
      openSettings().catch(console.error);
    }}
    icon="🛠"
    title="Square Reader Settings"
  />
));

export default function KioskSettingsScreen({ navigation }) {
  let [kioskName, setKioskName] = useKioskName();
  return (
    <GenericPage>
      <Hero icon="⚙️" title="Kiosk Settings" />
      <RowSection>
        <PaySettingsRow />
        <LinkRow
          onPress={() => {
            navigation.navigate({ routeName: 'PaymentDebug' });
          }}
          icon="💸"
          title="Test Payment"
        />
        <LinkRow
          onPress={() => {
            throw new Error('User-forced error!');
          }}
          icon="⚠️"
          title="Test App Error"
        />
        <LinkRow
          onPress={() => {
            AlertIOS.prompt(
              'New Kiosk Name',
              `Previously "${kioskName}"`,
              setKioskName,
            );
          }}
          icon="🖥"
          title={`Change kiosk name from "${kioskName}"`}
        />
        <UpdateAirtableRow />
      </RowSection>
    </GenericPage>
  );
}
