import React from 'react';

import SimplePage from '../components/SimplePage';
import RowSection from '../components/RowSection';
import LinkRow from '../components/LinkRow';
import AppInfoText from '../components/AppInfoText';
import useCloud from '../cloud-core/useCloud';
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
  return (
    <SimplePage
      {...props}
      navigation={navigation}
      icon="⚙️"
      title="Kiosk Settings"
    >
      <RowSection>
        <LinkRow
          onPress={() => {
            navigation.navigate({ routeName: 'ComponentPlayground' });
          }}
          icon="🧱"
          title="Component Playground"
        />
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
        <UpdateAirtableRow />
      </RowSection>
      <AppInfoText />
    </SimplePage>
  );
}

KioskSettingsScreen.navigationOptions = SimplePage.navigationOptions;
