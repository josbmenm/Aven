import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Button,
  Image,
} from 'react-native';
import { createSwitchNavigator } from '../react-navigation-core';

const navigateToSlide = (navigation, index) => {
  navigation.navigate({
    routeName: 'Slide',
    params: { index },
    key: `slide-${index}`,
  });
};

const navigateForward = navigation => {
  const { routes, index } = navigation.state;
  const { params } = routes[index];
  const lastSlide = Number(params.index) || 0;
  const nextSlide = lastSlide + 1 >= slides.length ? 0 : lastSlide + 1;
  navigateToSlide(navigation, nextSlide);
};

const navigateBack = navigation => {
  const { routes, index } = navigation.state;
  const { params } = routes[index];
  const lastSlide = Number(params.index) || 0;
  const prevSlide = lastSlide === 0 ? slides.length - 1 : lastSlide - 1;
  navigateToSlide(navigation, prevSlide);
};

const titleFontSize = 82;

const createTitle = (text, textStyle) => {
  return () => (
    <View style={{ flex: 1, justifyContent: 'center', padding: 80 }}>
      <Text
        style={{ fontSize: titleFontSize, textAlign: 'center', ...textStyle }}
      >
        {text}
      </Text>
    </View>
  );
};
const SocialRow = ({ icon, text, color }) => (
  <View style={{ flexDirection: 'row' }}>
    <Image
      source={icon}
      style={{ width: 80, height: 80, tintColor: color, marginTop: 15 }}
    />
    <Text style={{ fontSize: 62, margin: 13, color }}>{text}</Text>
  </View>
);
const createPersonSlide = ({ photo, twitter, github, message }) => ({
  navigation,
}) => {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {message && (
        <Text style={{ fontSize: titleFontSize, textAlign: 'center' }}>
          {message}
        </Text>
      )}
      <Image
        source={photo}
        style={{ width: 274, height: 274 }}
        resizeMode="contain"
      />
      <View style={{}}>
        {github && (
          <SocialRow
            icon={require('./images/github.svg')}
            text={github}
            color={'#4A4A4A'}
          />
        )}
        {twitter && (
          <SocialRow
            icon={require('./images/twitter.svg')}
            text={twitter}
            color={'#156A9F'}
          />
        )}
      </View>
    </View>
  );
};

const createGithubSlide = ({ project }) => () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Image
      source={require('./images/github.svg')}
      style={{
        width: 150,
        height: 150,
        tintColor: '#4A4A4A',
        marginBottom: 100,
      }}
    />
    <Text style={{ fontSize: titleFontSize, color: '#4A4A4A' }}>{project}</Text>
  </View>
);

const createFullVideoSlide = ({ videoFile }) => ({ navigation }) => {
  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          backgroundColor: 'black',
          paddingVertical: 60,
          paddingHorizontal: 10,
          borderRadius: 50,
        }}
      >
        <View style={{ width: 324, height: 580 }}>
          <video
            loop
            autoPlay
            src={`/${videoFile}`}
            style={{ width: 324, height: 580 }}
          />
        </View>
      </View>
    </View>
  );
};

const createVideoSlide = ({ videoFile }) => ({ navigation }) => {
  return (
    <View
      style={{
        flex: 1,
        padding: 100,
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          backgroundColor: 'black',
          paddingVertical: 60,
          paddingHorizontal: 10,
          borderRadius: 50,
        }}
      >
        <View style={{ width: 748, height: 1332 }}>
          <video
            loop
            autoPlay
            src={`/${videoFile}`}
            style={{ width: 748, height: 1332 }}
          />
        </View>
      </View>
    </View>
  );
};

const createLogoSlide = ({ logo }) => ({ navigation }) => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 250,
      }}
    >
      <Image
        source={logo}
        style={{ width: '100%', height: '100%' }}
        resizeMode="contain"
      />
    </View>
  );
};

const createNavLogoSlide = title => () => (
  <View style={{ flex: 1 }}>
    <Image
      style={{ flex: 1, marginTop: 80 }}
      resizeMode="contain"
      source={require('./images/reactnav.svg')}
    />
    <Text
      style={{
        marginVertical: 80,
        color: '#7B61C1',
        fontSize: titleFontSize,
        textAlign: 'center',
      }}
    >
      {title}
    </Text>
  </View>
);

const usageSlide = ({ children }) => (
  <View style={{ flex: 1 }}>
    <Image
      source={require('./images/npm-react-native.png')}
      style={{ flex: 1 }}
      resizeMode="contain"
    />
    <Image
      source={require('./images/npm-react-navigation.png')}
      style={{ flex: 1 }}
      resizeMode="contain"
    />
  </View>
);

const slides = [
  createPersonSlide({
    message: 'Owning Transitions',
    twitter: 'ericvicenti',
  }),
  createTitle('We need a full-stack database framework'),

  createNavLogoSlide('React Navigation'),

  createPersonSlide({
    github: 'ericvicenti',
    twitter: 'ericvicenti',
    photo: require('./images/ericvicenti.jpeg'),
  }),
  createTitle('Navigator', { textDecorationLine: 'line-through' }),
  createTitle('NavigationExperimental', { textDecorationLine: 'line-through' }),

  createNavLogoSlide('React Navigation'),
  // orig goal is to create a nav framework for react native that is easy to get started with, yet is fully customizable

  createTitle("Who's using it?"),
  usageSlide,
  // there are other options including native

  // who here is currently using it?
  // show off usage numbers
  // in good company, PlayStation, NFL, Urbandictionary

  createNavLogoSlide('React Navigation'),
  // orig goal is to create a nav framework for react native that is easy to get started with, yet is fully customizable

  // lots of complexity stems from expectations on iOS
  createVideoSlide({ videoFile: 'iossettings.mov' }),
  createVideoSlide({ videoFile: 'reactnavuikit.mov' }),
  // lots of complexity to unpack
  // notice the back button mask
  // we've ported the exact spring to reactnav

  createTitle('createStackNavigator()'),

  // contains navigation logic+view

  // v2
  createNavLogoSlide('v2'),

  createTitle('Decoupled logic from views'),
  createTitle('Demo'),

  // DemoA: StackNavigator createNavigator

  // Look, we can even customize to modal mode
  createTitle('Decoupled logic from views'),

  createTitle('Modal customization is limited'),

  // v3
  createNavLogoSlide('v3'),

  createTitle('Transitioner?'),
  // each screen should define its own transition
  // in navExperimental, we wanted to isolate animation logic from UIKit reimplementation
  createTitle('Experimental Transitioner'),

  createTitle('Transitioner in StackView today'),

  // look back to UIKit example. prev screen moves with top screen gesture..
  createVideoSlide({ videoFile: 'reactnavuikit.mov' }),

  createTitle('The gesture moves multiple screens?!'),
  // we had to give up on the idea of each screen definig its own transition
  createTitle('about that screen de-coupling..'), // stackView and trans are tightly coupled
  createTitle('People depend on StackView quirks'),

  // new transitioner to allow screens to define own transitions
  createTitle('New Transitioner'),
  // DemoB: new Transitioner

  createTitle('Demo'),

  createGithubSlide({
    project: 'kmagiera/\nreact-native-reanimated',
  }),
  createGithubSlide({
    project: 'kmagiera/\nreact-native-gesture-handler',
  }),

  createTitle('Demo'),

  createGithubSlide({
    project: 'fram-x/\nFluidTransitions',
  }),
  createPersonSlide({
    github: 'chrfalch',
    twitter: 'chrfalch',
    photo: require('./images/chrfalch.jpeg'),
  }),

  createTitle('Shared Elements'),

  createTitle('Demo'),

  createTitle('Screen Transform'),

  // DEMO

  createGithubSlide({
    project: 'react-navigation/\nreact-navigation-transitioner',
  }),

  // getting close using the new transitioner for stack view!

  createVideoSlide({ videoFile: 'reactnavuikit.mov' }),

  // other things stackView could never do, reachability and KB swipe, stay tuned
  createFullVideoSlide({ videoFile: 'kbswipe.mov' }),

  createPersonSlide({
    github: 'kmagiera',
    twitter: 'kzzzf',
    photo: require('./images/kmagiera.jpeg'),
  }),

  createLogoSlide({
    logo: require('./images/expo.png'),
  }),

  createPersonSlide({
    github: 'brentvatne',
    twitter: 'notbrent',
    photo: require('./images/brentvatne.jpeg'),
  }),

  createTitle('For everyone who has yet to participate,'),

  createPersonSlide({
    message: 'Welcome to the navigation community!',
    twitter: 'ericvicenti',
  }),
];

const Slide = ({ navigation }) => {
  const S = slides[navigation.getParam('index')];
  return <S navigation={navigation} />;
};
Slide.path = 'slide/:index';
Slide.navigationOptions = ({ navigation }) => ({
  title: `${navigation.getParam('index')} - RNEU 18`,
});

const Home = ({ navigation }) => (
  <View style={{ flex: 1 }}>
    <Button
      title="go"
      onPress={() => {
        navigateToSlide(navigation, 0);
      }}
    />
  </View>
);

const AppNavigator = createSwitchNavigator({
  Home,
  Slide,
});

const toggleFullScreen = () => {
  document.documentElement.webkitRequestFullscreen();
};
class App extends React.Component {
  static router = AppNavigator.router;
  render() {
    const { navigation } = this.props;
    return <AppNavigator navigation={navigation} />;
  }
  componentDidMount() {
    window.onkeypress = e => {
      const { navigation } = this.props;
      if (e.code === 'Space') {
        navigateForward(navigation);
      } else if (e.code === 'KeyF') {
        toggleFullScreen();
      }
      console.log('nan', e);
    };
    document.onkeydown = e => {
      const { navigation } = this.props;
      if (e.key === 'ArrowRight') {
        navigateForward(navigation);
      } else if (e.key === 'ArrowLeft') {
        navigateBack(navigation);
      } else if (e.key === 'PageUp') {
        navigateBack(navigation);
      } else if (e.key === 'PageDown') {
        navigateForward(navigation);
      } else {
        console.log('keydown', e);
      }
    };
  }
}

export default App;
