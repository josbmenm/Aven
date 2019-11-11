import React from 'react';
import ReactDOMServer from 'react-dom/server';

// @ts-ignore
import { View, Text } from 'react-native-web';

// @ts-ignore
function Coomp({ name }) {
  return (
    <View style={{ backgroundColor: 'blue' }}>
      <Text>{name}</Text>
    </View>
  );
}

console.log(
  ReactDOMServer.renderToString(
    <div>
      <Coomp name="aa" />
    </div>,
  ),
);
