import React from 'react';
import View from '../views/View';
import Heading from '../dashboard/Heading';
import Layout from './Layout';
import BlockFormInput from '../components/BlockFormInput';

function Inputs() {
  return (
    <Layout>
      <Heading>Inputs</Heading>
      <View style={{ marginVertical: 40 }}>
        <BlockFormInput value="hello world" />
      </View>
    </Layout>
  );
}

Inputs.navigationOptions = {
  title: 'Inputs',
};

export default Inputs;
