import createCloudContext from '../aven-cloud/createCloudContext';
import React from 'react';

const OnoRestaurantContext = createCloudContext();

export const withRestaurant = C => {
  return props => (
    <OnoRestaurantContext>
      {restaurant => <C {...props} restaurant={restaurant} />}
    </OnoRestaurantContext>
  );
};

export default OnoRestaurantContext;
