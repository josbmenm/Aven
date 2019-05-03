import React from 'react';
import { AlertIOS } from 'react-native';

import Hero from '../components/Hero';
import GenericPage from '../components/GenericPage';
import RowSection from '../components/RowSection';
import LinkRow from '../components/LinkRow';
import TextRow from '../components/TextRow';
import useCloud from '../cloud-core/useCloud';
import codePush from 'react-native-code-push';

function AppPushInfo() {
  let [updateMetadata, setUpdateMetadata] = React.useState(null);
  React.useEffect(() => {
    codePush
      .getUpdateMetadata()
      .then(m => {
        setUpdateMetadata(m);
      })
      .catch(() => {});
    return () => {};
  }, []);
  return (
    (updateMetadata || null) && (
      <TextRow
        text={`Native v${updateMetadata.appVersion} App ${
          updateMetadata.label
        }`}
      />
    )
  );
}

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
    <GenericPage {...props} navigation={navigation}>
      <Hero icon="⚙️" title="Kiosk Settings" />
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
      <AppPushInfo />
    </GenericPage>
  );
}

KioskSettingsScreen.navigationOptions = GenericPage.navigationOptions;
