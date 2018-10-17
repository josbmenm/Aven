import React, { Component } from 'react';
import { Text } from 'react-native';
import Title from '../../ono-components/Title';

import GenericPage from '../components/GenericPage';
import RowSection from '../../ono-components/RowSection';
import LinkRow from '../../ono-components/LinkRow';

export default class KitchenEngScreen extends Component {
  render() {
    const { navigation } = this.props;
    return (
      <GenericPage>
        <Title>Kitchen Engineering</Title>
        <RowSection />
      </GenericPage>
    );
  }
}
