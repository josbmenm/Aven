import React, { Component } from 'react';
import Hero from '../../ono-components/Hero';

import GenericPage from '../components/GenericPage';
import RowSection from '../../ono-components/RowSection';
import Row from '../../ono-components/Row';
import Button from '../../ono-components/Button';

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
