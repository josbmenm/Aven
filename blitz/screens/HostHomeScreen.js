import React, { Component } from 'react';
import Hero from '../../components/Hero';

import GenericPage from '../components/GenericPage';
import RowSection from '../../components/RowSection';
import Row from '../../components/Row';
import Button from '../../components/Button';

export default class HomeScreen extends Component {
  render() {
    return (
      <GenericPage>
        <Hero icon="🖥" title="Maui Host" />
        <RowSection>
          <Row>
            <Button title="Make Free Blend" onPress={() => {}} />
          </Row>
        </RowSection>
      </GenericPage>
    );
  }
}
