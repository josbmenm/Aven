import React from 'react';
import View from '../views/View';
import Heading from '../dashboard/Heading';

function Inputs() {
  return (
    <View>
      <Heading style={{ color: 'black', fontSize: 80 }}>Inputs</Heading>
    </View>
  );
}

Inputs.navigationOptions = {
  title: 'Inputs',
};

export default Inputs;
