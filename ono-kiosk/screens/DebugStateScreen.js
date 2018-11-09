import React from 'react';
import JSONView from '../../debug-views/JSONView';
import GenericPage from '../components/GenericPage';
import { withRestaurant, withKitchenLog } from '../../ono-cloud/OnoKitchen';
import Hero from '../../ono-components/Hero';

function DebugStateScreenWithState({ restaurant, kitchenLog }) {
  return (
    <GenericPage>
      <Hero title="Restaurant State" />
      <JSONView data={restaurant} />
      <JSONView data={kitchenLog} />
    </GenericPage>
  );
}

const DebugStateScreen = withKitchenLog(
  withRestaurant(DebugStateScreenWithState),
);

export default DebugStateScreen;
