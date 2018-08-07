import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Button,
  TouchableOpacity,
  Image,
} from 'react-native';
import { createSwitchNavigator } from '../react-navigation-core';

const colors = {
  bg: '#FFF3EB',
  link: '#4987F9',
  title: '#4E6F9D',
};

const LogoText = () => (
  <Text
    style={{
      fontSize: 64,
      color: colors.title,
      fontFamily: 'Shrikhand',
      marginVertical: 25,
    }}
  >
    ono
  </Text>
);

const Main = () => <LogoText />;

const fontsCSS = `
@font-face {
  src: url('/fonts/Shrikhand.otf');
  font-family: Shrikhand;
}
@font-face {
  src: url('/fonts/ArbutusSlab.ttf');
  font-family: ArbutusSlab;
}
`;

Main.navigationOptions = {
  backgroundColor: colors.bg,
  title: 'Kiosk',
  customCSS: fontsCSS,
};

const App = createSwitchNavigator({
  Main,
});

export default App;
