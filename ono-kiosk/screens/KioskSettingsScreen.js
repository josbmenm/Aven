import React, { Component } from 'react';
import { Text } from 'react-native';
import Hero from '../../ono-components/Hero';

import GenericPage from '../components/GenericPage';
import RowSection from '../../ono-components/RowSection';
import LinkRow from '../../ono-components/LinkRow';
import { openSettings } from '../Payments';
import { withRestaurant } from '../../ono-cloud/OnoRestaurantContext';

function UpdateAirtableRowWithRestaurant({ restaurant }) {
  return (
    <LinkRow
      onPress={() => {
        restaurant
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
const UpdateAirtableRow = withRestaurant(UpdateAirtableRowWithRestaurant);

export default class KioskSettingsScreen extends Component {
  render() {
    const { navigation } = this.props;
    return (
      <GenericPage>
        <Hero icon="⚙️" title="Kiosk Settings" />
        <RowSection>
          <LinkRow
            onPress={() => {
              openSettings().catch(console.error);
            }}
            icon="🛠"
            title="Square Reader Settings"
          />
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
          <UpdateAirtableRow />
        </RowSection>
      </GenericPage>
    );
  }
}
