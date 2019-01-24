import React from 'react';
import { AlertIOS } from 'react-native';
import Hero from '../../components/Hero';

import GenericPage from '../components/GenericPage';
import RowSection from '../../components/RowSection';
import LinkRow from '../../components/LinkRow';
import useCloud from '../../aven-cloud/useCloud';
import useKioskName from '../useKioskName';
import codePush from 'react-native-code-push';

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

export default function KioskSettingsScreen({ navigation, ...props }) {
  let [kioskName, setKioskName] = useKioskName();
  return (
    <GenericPage {...props} navigation={navigation}>
      <Hero icon="⚙️" title="Kiosk Settings" />
      <RowSection>
        <LinkRow
          onPress={() => {
            navigation.navigate({ routeName: 'PaymentDebug' });
          }}
          icon="💸"
          title="Card Reader Debugging"
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
            codePush.restartApp();
          }}
          icon="♻️"
          title="Refresh App"
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

KioskSettingsScreen.navigationOptions = GenericPage.navigationOptions;
