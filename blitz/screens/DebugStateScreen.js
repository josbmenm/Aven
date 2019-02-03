import React from 'react';
import JSONView from '../../debug-views/JSONView';
import GenericPage from '../components/GenericPage';
import { withRestaurant } from '../../ono-cloud/OnoKitchen';
import Hero from '../../components/Hero';

export default function DebugStateScreenWithState() {
  return (
    <GenericPage>
      <Hero title="Restaurant State" />
    </GenericPage>
  );
}
