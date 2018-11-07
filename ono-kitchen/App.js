import { View, Text } from 'react-native';
import React, { useState } from 'react';

import { useKitchen } from '../ono-cloud/OnoKitchenHooks';

import OnoRestaurantContext from '../ono-cloud/OnoRestaurantContext';
import { withKitchen } from '../ono-cloud/OnoKitchen';

// import { mainMenu } from '../ono-cloud/OnoCloud';
// import { withObservables } from '../aven-cloud/DataClient';

// const FooA = withObservables(['mainMenu'], ({ mainMenu }) => ({
//   menu: mainMenu,
// }))(
//   ({ menu }) =>
//     menu ? (
//       <Text>Menu has {menu.length} items</Text>
//     ) : (
//       <Text>Menu not loaded</Text>
//     ),
// );

// function Foo() {
//   const { kitchenState, kitchenConfig } = useKitchen();
//   return (
//     <Text>
//       {JSON.stringify(kitchenState)} {JSON.stringify(kitchenConfig)}
//     </Text>
//   );
// }

function FooWithKitchen({ kitchenState, kitchenConfig }) {
  return (
    <Text>
      {JSON.stringify(kitchenState)} {JSON.stringify(kitchenConfig)}
    </Text>
  );
}
const Foo = withKitchen(FooWithKitchen);

function Zone({ name }) {
  const [isShowingFoo, setShowingFoo] = useState(false);
  return (
    <View style={{ flex: 1 }}>
      <Text
        onPress={() => {
          setShowingFoo(!isShowingFoo);
        }}
      >
        Toggle data {name} : {isShowingFoo ? 'showing' : 'not showing'}
      </Text>
      {isShowingFoo && <Foo />}
    </View>
  );
}

export default function App({ env }) {
  return (
    <View style={{ flex: 1 }}>
      <Zone name="A" />
      <Zone name="B" />
    </View>
  );
}
