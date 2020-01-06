import React from 'react';
import { View, Text } from 'react-native';
import createFullscreenSwitchNavigator from '../navigation-web/createFullscreenSwitchNavigator';
import { CloudContext } from '../cloud-core/KiteReact';
import DemoScreen from './DemoScreen';

const NotFoundPage = () => (
  <View
    style={{
      flex: 1,
      overflow: 'hidden',
      justifyContent: 'center',
      flexDirection: 'row',
    }}
  >
    <Text
      style={{
        fontSize: 24,
        fontFamily: 'Maax',
      }}
    >
      not found
    </Text>
  </View>
);

const fontsCSS = `
@font-face {
  src: url('/fonts/Maax - Bold-205TF/Maax - Bold-205TF.ttf');
  font-family: Maax-Bold;
}
@font-face {
  src: url('/fonts/Maax - Regular-205TF/Maax - Regular-205TF.ttf');
  font-family: Maax;
}
@font-face {
  src: url('/fonts/Lora.ttf');
  font-family: Lora;
}
@font-face {
  src: url('/fonts/Lora-Bold.ttf');
  font-weight: bold;
}
a:active {
  color: inherit;
}
a:hover {
  color: inherit;
}
a {
  color: inherit;
}
`;

const AppNavigator = createFullscreenSwitchNavigator(
  {
    Main: {
      screen: NotFoundPage,
      navigationOptions: {
        backgroundColor: '#FFFFFF',
        title: 'aven demo',
        customCSS: fontsCSS,
      },
    },
    FeedbackData: {
      screen: DemoScreen,
      path: '',
      navigationOptions: {
        backgroundColor: '#FFFFFF',
        title: 'aven demo',
        customCSS: fontsCSS,
      },
    },
  },
  {},
);

function App(props) {
  const cloud = React.useContext(CloudContext);
  return <AppNavigator {...props} screenProps={{ cloud }} />;
}

App.router = AppNavigator.router;
App.navigationOptions = AppNavigator.navigationOptions;

export default App;
