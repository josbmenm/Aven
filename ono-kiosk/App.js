import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Button,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { createStackNavigator } from '../react-navigation-stack';
import { Transitioner } from '../react-navigation-transitioner';

const colors = {
  bg: '#FFF3EB',
  link: '#4987F9',
  title: '#4E6F9D',
};
const smoothOpenAnimator = value =>
  new Promise(resolve => {
    Animated.timing(value, {
      duration: 300,
      toValue: 1,
    }).start(resolve);
  });
const smoothCloseAnimator = value =>
  new Promise(resolve => {
    Animated.timing(value, {
      duration: 300,
      toValue: 0,
    }).start(resolve);
  });

class FadeInTransition extends React.Component {
  static navigationOptions = {
    openAnimator: smoothOpenAnimator,
    closeAnimator: smoothCloseAnimator,
  };
  render() {
    const { progress, navigation, children } = this.props;
    return (
      <Animated.View
        style={{
          flex: 1,
          opacity: progress,
          backgroundColor: 'white',
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0],
              }),
            },
          ],
        }}
      >
        {children}
      </Animated.View>
    );
  }
}

const LogoText = () => (
  <Text
    style={{
      fontSize: 64,
      color: colors.title,
      fontFamily: 'Shrikhand',
      marginVertical: 25,
    }}
  >
    ono kiosk
  </Text>
);

class Home extends React.Component {
  static navigationOptions = FadeInTransition.navigationOptions;
  render() {
    const { navigation } = this.props;
    return (
      <FadeInTransition {...this.props}>
        <LogoText />
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Product');
          }}
        >
          <Text>Order Smoothie</Text>
        </TouchableOpacity>
      </FadeInTransition>
    );
  }
}

class Product extends React.Component {
  static navigationOptions = FadeInTransition.navigationOptions;
  render() {
    const { navigation } = this.props;
    return (
      <FadeInTransition {...this.props}>
        <Text
          style={{
            fontSize: 64,
            color: colors.title,
            fontFamily: 'Shrikhand',
            marginVertical: 25,
          }}
        >
          product
        </Text>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Text>go back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Order');
          }}
        >
          <Text>Check out</Text>
        </TouchableOpacity>
      </FadeInTransition>
    );
  }
}

class Order extends React.Component {
  static navigationOptions = FadeInTransition.navigationOptions;
  render() {
    return (
      <FadeInTransition {...this.props}>
        <Text
          style={{
            fontSize: 64,
            color: colors.title,
            fontFamily: 'Shrikhand',
            marginVertical: 25,
          }}
        >
          order
        </Text>
      </FadeInTransition>
    );
  }
}

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

const App = Transitioner(
  {
    Home: {
      screen: Home,
      path: '',
    },
    Product,
    Order,
  },
  {
    navigationOptions: {
      title: 'ono kiosk',
      backgroundColor: colors.bg,
      customCSS: fontsCSS,
    },
  },
);

export default App;
