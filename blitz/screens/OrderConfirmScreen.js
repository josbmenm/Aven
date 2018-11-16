import React, { Component } from 'react';
import GenericPage from '../components/GenericPage';
import Hero from '../../components/Hero';

export default class OrderConfirm extends Component {
  render() {
    return (
      <GenericPage>
        <Hero title="Confirm Order" />
      </GenericPage>
    );
  }
}
