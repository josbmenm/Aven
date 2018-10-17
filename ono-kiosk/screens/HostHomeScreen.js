import React, { Component } from 'react';
import { Text } from 'react-native';
import Title from '../../ono-components/Title';

import GenericPage from '../components/GenericPage';
import RowSection from '../../ono-components/RowSection';
import Row from '../../ono-components/Row';
import Button from '../../ono-components/Button';

export default class HomeScreen extends Component {
  render() {
    // <DebugData input={Client.getRef('airtable').observeObjectValue} />
    // <DebugData input={Client.getRef('truckState').observeObjectValue} />
    // <ConnectionStatus />
    const { navigation } = this.props;
    return (
      <GenericPage>
        <Text style={{ fontSize: 100, textAlign: 'center' }}>🖥</Text>
        <Title>Maui Host</Title>
        <RowSection>
          <Row>
            <Button title="Make Free Blend" onPress={() => {}} />
          </Row>
        </RowSection>
      </GenericPage>
    );
  }
}
