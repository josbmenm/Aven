import React from 'react';
import InputPage from '../components/InputPage';
import { withRestaurant } from '../../ono-cloud/OnoKitchen';

function CollectEmailWithRestaurant({ navigation, cloud }) {
  return (
    <InputPage
      title={'Receipt Email'}
      type="email-address"
      onSubmit={email => {
        cloud
          .dispatch({
            type: 'PutAuthMethod',
            verificationInfo: { email, context: 'Receipt' },
          })
          .catch(console.error)
          .then(() => {
            navigation.navigate('OrderComplete');
          });
      }}
    />
  );
}

const CollectEmail = withRestaurant(CollectEmailWithRestaurant);

export default CollectEmail;
