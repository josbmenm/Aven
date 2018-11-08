import React from 'react';
import JSONView from '../../debug-views/JSONView';
import GenericPage from '../components/GenericPage';
import { withRestaurant } from '../../ono-cloud/OnoKitchen';

function DebugStateScreenWithState({ restaurant }) {
  return (
    <GenericPage>
      <JSONView data={restaurant} />
    </GenericPage>
  );
}

const DebugStateScreen = withRestaurant(DebugStateScreenWithState);

export default DebugStateScreen;
