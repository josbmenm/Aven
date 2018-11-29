import React from 'react';
import InputPage from '../components/InputPage';
import { withRestaurant } from '../../ono-cloud/OnoKitchen';

function CollectNameWithRestaurant({ navigation, setOrderName }) {
  return (
    <InputPage
      {...this.props}
      title={'Pickup Name'}
      onSubmit={name => {
        setOrderName(name);
        navigation.navigate('OrderComplete');
      }}
    />
  );
}
const CollectName = withRestaurant(CollectNameWithRestaurant);

export default CollectName;
