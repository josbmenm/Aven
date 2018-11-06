import { View, Text } from 'react-native';
import React, { useContext } from 'react';

import { useState, useEffect } from 'react';

import OnoRestaurantContext from '../ono-cloud/OnoRestaurantContext';

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

function useObservableBehavior(behavior) {
  const [value, setValue] = useState(behavior.value);

  useEffect(
    () => {
      const subscription = behavior.subscribe(setValue);
      return () => subscription.unsubscribe();
    },
    [behavior],
  );

  return value;
}

function Foo() {
  const restaurant = useContext(OnoRestaurantContext);
  const kitchen = useObservableBehavior(
    restaurant.getRef('KitchenState').observeValue,
  );
  return <Text>{JSON.stringify(kitchen)}</Text>;
}

export default class App extends React.Component {
  render() {
    const { env } = this.props;
    return (
      <View style={{ flex: 1 }}>
        <Text
          onPress={() => {
            alert('hello');
          }}
        >
          Ono Kitchen
        </Text>
        <Foo />
      </View>
    );
  }
}
