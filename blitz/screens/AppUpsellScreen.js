import React from 'react';
import InputPage from '../../components/InputPage';
import { withRestaurant } from '../../ono-cloud/OnoKitchen';

function AppUpsellWithRestaurant({ navigation, setAppUpsellPhoneNumber }) {
  return (
    <InputPage
      {...this.props}
      title={'SMS for mobile app'}
      type="phone-pad"
      onSubmit={number => {
        setAppUpsellPhoneNumber(number);
        navigation.navigate('OrderComplete');
      }}
    />
  );
}
const AppUpsell = withRestaurant(AppUpsellWithRestaurant);

export default AppUpsell;
