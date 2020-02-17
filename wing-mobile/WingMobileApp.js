import React from 'react';
import {View} from '@rn';
import {Button} from '@aven/plane';

export default function App() {
  React.useEffect(() => {
    console.log('app did mount');
  }, []);
  return (
    <View style={{flex: 1, paddingTop: 40}}>
      <Button title="click me" />
    </View>
  );
}
