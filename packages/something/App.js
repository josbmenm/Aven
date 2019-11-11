import * as React from 'react';
import {View, Text} from 'react-native';
import {NavigationNativeContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {AppHeader} from '@aven-cloud/dash';

export default function HomeScreen() {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <AppHeader />
    </View>
  );
}

// const Stack = createStackNavigator();
// debugger;
// function App() {
//   return (
//     <NavigationNativeContainer>
//       <Stack.Navigator>
//         <Stack.Screen name="Home" component={HomeScreen} />
//       </Stack.Navigator>
//     </NavigationNativeContainer>
//   );
// }

// export default App;
