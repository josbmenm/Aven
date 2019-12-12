import React from 'react';
import View from '../views/View';
import Heading from '../dashboard/Heading';
import { Layout, Container } from './Layout';
import BlockFormInput from '../components/BlockFormInput';

function Inputs() {
  return (
    <Layout>
      <Heading>Inputs</Heading>
      <Container>
        <BlockFormInput value="hello world" />
      </Container>
    </Layout>
  );
}

Inputs.navigationOptions = {
  title: 'Inputs',
};

export default Inputs;
