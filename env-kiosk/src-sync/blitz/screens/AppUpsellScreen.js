import React from 'react';
import InputPage from '../../components/InputPage';

function AppUpsell({ navigation, setAppUpsellPhoneNumber }) {
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

export default AppUpsell;
