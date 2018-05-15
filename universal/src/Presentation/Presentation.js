import React from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import {
  FullApp,
  Home,
  Overview,
  Search,
  Lesson,
  Login,
  BasicSwitch,
  BasicStack,
  StackWithPushBug,
  SwitchInStack,
} from './DemoApp';

import {
  createSwitchNavigator,
  NavigationActions,
} from '../react-navigation-core';
import { createStaticContainer } from '../react-navigation-static-container';
// import {
//   createNavigationContainer,
//   createStackNavigator,
// } from 'react-navigation';
import SyntaxHighlighter from 'react-syntax-highlighter/prism';
import { coy } from 'react-syntax-highlighter/styles/prism';

const createTitleSlide = title => {
  class TitleSlide extends React.Component {
    render() {
      return (
        <View
          style={{
            padding: 30,
            justifyContent: 'center',
            flex: 1,
            borderWidth: 30,
          }}>
          <Text style={{ fontSize: 80, textAlign: 'center' }}>{title}</Text>
        </View>
      );
    }
  }
  return TitleSlide;
};

const createMultiTitleSlide = titles => {
  class TitleSlide extends React.Component {
    render() {
      return (
        <View style={{ padding: 30, justifyContent: 'center' }}>
          {titles.map(title => (
            <Text
              style={{ fontSize: 80, marginVertical: 40, textAlign: 'center' }}>
              {title}
            </Text>
          ))}
        </View>
      );
    }
  }
  return TitleSlide;
};

const CodeSlideCompanion = ({ Component, navigation, standalone }) =>
  standalone ? (
    <Component navigation={navigation} />
  ) : (
    <PhoneView>
      <Component navigation={navigation} />
    </PhoneView>
  );

const createCodeSlide = (codeString, opts) => {
  class TitleSlide extends React.Component {
    static router = opts && opts.Component && opts.Component.router;
    render() {
      return (
        <View
          style={{
            flex: 1,
            padding: 30,
            justifyContent: 'space-between',
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <SyntaxHighlighter
            customStyle={{ fontSize: 36 }}
            language="javascript"
            style={coy}
            highlighter={'prism' || 'hljs'}>
            {codeString}
          </SyntaxHighlighter>
          {opts && <CodeSlideCompanion {...this.props} {...opts} />}
        </View>
      );
    }
  }
  return TitleSlide;
};

const createMainTitleSlide = createTitleSlide;

const DemoScreen = ({ color, title }) => (
  <View
    style={{
      borderWidth: 20,
      borderColor: color,
      backgroundColor: 'white',
      flex: 1,
      justifyContent: 'center',
    }}>
    <Text style={{ fontSize: 42, color: color, textAlign: 'center' }}>
      {title}
    </Text>
  </View>
);

const createSoloDemoSlide = App => {
  const DemoSlide = ({ navigation }) => (
    <PhonesSet>
      <PhoneView>
        <App navigation={navigation} />
      </PhoneView>
    </PhonesSet>
  );
  DemoSlide.router = App.router;
  return DemoSlide;
};

const createStaticDemoSlide = DemoApps => {
  const StaticDemos = DemoApps.map(DemoApp => createStaticContainer(DemoApp));
  const DemoSlide = () => (
    <PhonesSet>
      {StaticDemos.map(StaticDemo => (
        <PhoneView>
          <StaticDemo />
        </PhoneView>
      ))}
    </PhonesSet>
  );
  return DemoSlide;
};

const PhoneView = ({ children }) => (
  <View
    style={{
      overflow: 'hidden',
      backgroundColor: 'black',
      paddingVertical: 50,
      borderRadius: 40,
      paddingHorizontal: 10,
      height: 640,
      width: 320,
    }}>
    <View style={{ flex: 1, backgroundColor: 'white' }} children={children} />
  </View>
);
const PhonesSet = ({ children }) => (
  <View
    style={{
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    }}>
    {children}
  </View>
);

const preso = [];

preso.push(createMainTitleSlide('Full Stack Navigation'));

preso.push(createTitleSlide('who is @ericvicenti'));

preso.push(createTitleSlide('React Navigation'));
preso.push(createTitleSlide('v2'));

preso.push(createTitleSlide('Lets build an education app!'));

preso.push(
  createCodeSlide(`
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import LessonScreen from './screens/LessonScreen';
`),
);

preso.push(
  createCodeSlide(`
<LoginScreen />
<HomeScreen />
<LessonScreen />
`),
);

preso.push(createStaticDemoSlide([Login, Home, Overview]));

preso.push(createTitleSlide('Before navigation..'));

preso.push(
  createCodeSlide(
    `
const App = LoginScreen;
`,
    { Component: Login },
  ),
);

// preso.push(createSoloDemoSlide(Login));

preso.push(createTitleSlide('Switch Navigator'));

preso.push(
  createCodeSlide(
    `
import { createSwitchNavigator } from 'react-navigation';

const App = createSwitchNavigator({
  LoginRoute: LoginScreen,
  HomeRoute: HomeScreen,
});
`,
    { Component: Login },
  ),
);

preso.push(
  createCodeSlide(
    `
import { createSwitchNavigator } from 'react-navigation';

const App = createSwitchNavigator({
  LoginRoute: LoginScreen,
  HomeRoute: HomeScreen,
}, {
  initialRouteName: 'LoginRoute'
});
`,
    { Component: Login },
  ),
);

preso.push(createStaticDemoSlide([Login]));

preso.push(
  createCodeSlide(
    `
class LoginScreen {

  handleLoginSuccess() {
    this.props.navigation.navigate('HomeRoute');
  }

  ...
}
`,
    { Component: BasicSwitch },
  ),
);

preso.push(
  createCodeSlide(
    `
const App = createSwitchNavigator({
  LoginRoute: LoginScreen,
  HomeRoute: HomeScreen,
});
`,
    { Component: BasicSwitch },
  ),
);

// BasicSwitch

preso.push(createTitleSlide('Switch Navigator'));

preso.push(createTitleSlide('Stack Navigator'));

preso.push(
  createCodeSlide(
    `
import { createStackNavigator } from 'react-navigation';

const App = createStackNavigator({
  HomeRoute: HomeScreen,
  LessonRoute: LessonScreen,
});
`,
    { Component: BasicStack },
  ),
);

preso.push(createTitleSlide('Passing Params'));

preso.push(
  createCodeSlide(
    `
class HomeScreen extends React.Component {

  onOpenLessonA() {
    this.props.navigation.navigate('LessonRoute', { id: 'A' });
  }

  ...
}
`,
    { Component: BasicStack },
  ),
);

preso.push(
  createCodeSlide(
    `
class LessonScreen extends React.Component {

  render() {
    const lessonID = this.props.navigation.getParam('id');
    ...
`,
    { Component: BasicStack },
  ),
);

preso.push(createTitleSlide('Push to stack'));

preso.push(
  createCodeSlide(
    `
class LessonScreen extends React.Component {

  onOpenLessonA() {
    this.props.navigation.navigate('LessonRoute', { id: 'A' });
  }

  ...
}
`,
    { Component: StackWithPushBug },
  ),
);

preso.push(
  createCodeSlide(
    `
class LessonScreen extends React.Component {

  onOpenLessonA() {
    this.props.navigation.push('LessonRoute', { id: 'A' });
  }

  ...
}
`,
    { Component: BasicStack },
  ),
);

preso.push(createTitleSlide('Navigation Options'));

preso.push(
  createCodeSlide(
    `
class HomeScreen extends React.Component {

  static navigationOptions = {
    headerTitle: 'Welcome'
  }
  
  ...
}
`,
    { Component: BasicStack },
  ),
);

preso.push(
  createCodeSlide(
    `
class HomeScreen extends React.Component {

  static navigationOptions = {
    headerTitle: 'Welcome'
  }
  
  render() {...}
}
`,
    { Component: BasicStack },
  ),
);

preso.push(
  createCodeSlide(
    `
class LessonScreen extends React.Component {

  static navigationOptions = ({ navigation }) => ({
    headerTitle: \`Lesson \${navigation.getParam('id')}\`
  });

  ...
}
`,
    { Component: BasicStack },
  ),
);

preso.push(createTitleSlide('Composing Navigators'));

preso.push(
  createCodeSlide(`
import {
  createStackNavigator,
  createSwitchNavigator,
} from 'react-navigation';
`),
);
preso.push(
  createCodeSlide(
    `
const App = createSwitchNavigator({
  LoginRoute: LoginScreen,
  MainRoute: createStackNavigator({
    HomeRoute: HomeScreen,
    LessonRoute: LessonScreen,
  }),
});
`,
    { Component: SwitchInStack },
  ),
);

preso.push(
  createCodeSlide(`
this.props.navigation.navigate('HomeRoute');
`),
);

preso.push(
  createCodeSlide(`
this.props.navigation.navigate('LessonRoute', { id: 'A' });
`),
);

preso.push(createTitleSlide('Composing Navigators'));

preso.push(createTitleSlide('Tab Navigator'));

preso.push(
  createCodeSlide(`
const HomeStackNavigator = createStackNavigator({
  HomeRoute: HomeScreen,
  LessonRoute: LessonScreen,
});
`),
);

preso.push(
  createCodeSlide(`
const OverviewStackNavigator = createStackNavigator({
  OverviewRoute: OverviewScreen,
  LessonRoute: LessonScreen,
});
`),
);

preso.push(
  createCodeSlide(`
const App = createSwitchNavigator({
  LoginRoute: LoginScreen,
  MainRoute: createTabNavigator({
    HomeTab: HomeStackNavigator,
    OverviewTab: OverviewStackNavigator,
  }),
});
`),
);

preso.push(createTitleSlide('Custom Navigators'));

preso.push(
  createCodeSlide(`
  const App = createSwitchNavigator({
    LoginRoute: LoginScreen,
    MainRoute: MainNavigator,
  });
  `),
);
preso.push(
  createCodeSlide(`
  const App = createSwitchNavigator({
    LoginRoute: LoginScreen,
    MainRoute: CustomNavigator,
  });
  `),
);

preso.push(
  createCodeSlide(`
class CustomNavigator extends React.Component {
  
  render() {
    return <MainNavigator />;
  }

}
`),
);

preso.push(
  createCodeSlide(`
class CustomNavigator extends React.Component {

  static router = MainNavigator.router;

  render() {
    const {navigation} = this.props;
    return <MainNavigator navigation={navigation} />;
  }
}
`),
);

preso.push(createTitleSlide('Controlling Navigators'));

preso.push(
  createCodeSlide(`
class MyNavigator extends React.Component {

  static router = MainNavigator.router;
  
  render() {
    const {navigation} = this.props;
    return <MainNavigator navigation={navigation} />;
  }
}
`),
);

preso.push(createTitleSlide('Navigation Containers'));

preso.push(
  createCodeSlide(`
import {
  createNavigationContainer
} from 'react-navigation';

const App = createNavigationContainer(MyNavigator);
`),
);

preso.push(createTitleSlide('Navigation State'));

preso.push(createTitleSlide('<State: App.MainTab.HomeRoute>'));

preso.push(createTitleSlide('Navigation Actions'));

preso.push(
  createCodeSlide(`
NavigationActions.navigate({
  routeName: 'OverviewTab'
});
`),
);

preso.push(
  createCodeSlide(`
this.props.navigation.dispatch(
  NavigationActions.navigate({
    routeName: 'OverviewTab'
  })
);
`),
);

preso.push(
  createCodeSlide(`
this.props.navigation.navigate('OverviewTab');
`),
);

preso.push(createTitleSlide('How Routers work'));

preso.push(
  createCodeSlide(`
const action = NavigationActions.navigate({
  routeName: 'OverviewTab'
});
`),
);

preso.push(
  createCodeSlide(`
const App = createSwitchNavigator({
  LoginRoute: LoginScreen,
  MainRoute: createTabNavigator({
    HomeTab: HomeStackNavigator,
    OverviewTab: OverviewStackNavigator,
  }),
});
`),
);

preso.push(
  createCodeSlide(`
App.router
`),
);
preso.push(
  createCodeSlide(`
App.router.getStateForAction(action, lastState);
`),
);
preso.push(
  createCodeSlide(`
state = App.router.getStateForAction(action, lastState);
`),
);

preso.push(createTitleSlide('URL Handling'));

preso.push(
  createCodeSlide(`
my-app://
`),
);

preso.push(
  createCodeSlide(`
my-app://LoginRoute
`),
);

preso.push(
  createCodeSlide(`
my-app://MainRoute/HomeTab/LessonRoute
`),
);

preso.push(
  createCodeSlide(`
my-app://MainRoute/HomeTab/LessonRoute?id=A
`),
);

preso.push(createTitleSlide('URLs open on cold start'));

preso.push(
  createCodeSlide(`
my-app://MainRoute/HomeTab/LessonRoute?id=A
`),
);

preso.push(createTitleSlide('<State: App.MainRoute.HomeTab.LessonRoute>'));

preso.push(createTitleSlide('URLs change state when app is open'));

preso.push(
  createCodeSlide(`
my-app://MainRoute/OverviewTab/LessonRoute?id=B
`),
);

preso.push(createTitleSlide('<State: App.MainRoute.OverviewTab.LessonRoute>'));

preso.push(createTitleSlide('URLs change the state, they dont define it'));

preso.push(createTitleSlide('URLs are actions!'));

preso.push(createTitleSlide('Routers convert URLs to Actions'));

preso.push(createTitleSlide('Can this work on the web?'));

preso.push(createTitleSlide('Routers output URLs for active state'));

preso.push(createTitleSlide('react-native-web'));

preso.push(createTitleSlide('react-navigation-web'));

preso.push(
  createCodeSlide(`
import {
  createNavigationContainer
} from 'react-navigation-web';

const App = createNavigationContainer(MyNavigator);
`),
);

preso.push(createTitleSlide('Demo time'));
preso.push(createTitleSlide('Demo time - Start with nested mobile nav'));
preso.push(createTitleSlide('Demo time - Run on web'));
preso.push(createTitleSlide('Demo time - create web container'));
preso.push(createTitleSlide('Demo time - Custom Flow Navigator'));

preso.push(createTitleSlide('Extensibility'));

preso.push(
  createCodeSlide(`
const App = createSwitchNavigator({
  LoginRoute: LoginScreen,
  HomeRoute: HomeScreen,
});
`),
);

preso.push(
  createCodeSlide(`
const App = createSwitchNavigator({
  LoginRoute: createAuthNavigator({...}),
  HomeRoute: HomeScreen,
});
`),
);

preso.push(createTitleSlide('Community Navigators'));

preso.push(
  createMultiTitleSlide([
    'https://github.com/react-navigation/react-navigation-tabs',
    'https://github.com/fram-x/FluidTransitions',
  ]),
);

preso.push(
  createMultiTitleSlide([
    'reactnavigation.org',
    'Github+Twitter: @reactnavigation',
  ]),
);
preso.push(createMultiTitleSlide(['aven.io', 'Github+Twitter: @ericvicenti']));

preso.push(createTitleSlide('Go forth, navigate on every platform,'));

preso.push(
  createMultiTitleSlide([
    'Go forth, navigate on every platform,',
    'and share your work with the world!',
  ]),
);

const slideRouteConfigs = {};
preso.forEach((slide, slideIndex) => {
  slide.index = slideIndex;
  slideRouteConfigs[`Slide${slideIndex}`] = slide;
});

const PresoSwitch = createSwitchNavigator(slideRouteConfigs);

const PresoRouter = {
  ...PresoSwitch.router,
  getStateForAction(action, lastState) {
    if (action.type === 'NextSlide') {
      const nextAction = NavigationActions.navigate({
        routeName: `Slide${lastState.index + 1}`,
      });
      console.log(nextAction);
      return PresoSwitch.router.getStateForAction(nextAction, lastState);
    }
    if (action.type === 'PrevSlide') {
      const prevAction = NavigationActions.navigate({
        routeName: `Slide${lastState.index - 1}`,
      });
      console.log(prevAction);
      return PresoSwitch.router.getStateForAction(prevAction, lastState);
    }
    if (action.type === 'ResetSlide') {
      return PresoSwitch.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'Slide0' }),
        lastState,
      );
    }

    if (action.type === 'ChapterJump') {
      // todo
    }

    return PresoSwitch.router.getStateForAction(action, lastState);
  },
  getScreenOptions(childNavigation) {
    return {
      ...PresoSwitch.router.getScreenOptions(childNavigation),
      title: `Navigation ${childNavigation.state.routeName}`,
    };
  },
};

class Presentation extends React.Component {
  static router = PresoRouter;
  componentDidMount() {
    window.onkeypress = e => {
      const { dispatch } = this.props.navigation;
      switch (e.key) {
        case ' ':
          return dispatch({ type: 'NextSlide' });
        case 'q':
          return dispatch({ type: 'ResetSlide' });
        case 'f':
          return toggleFullScreen();
        case '0':
          return dispatch({ type: 'ChapterJump', chapter: 0 });
        case '1':
          return dispatch({ type: 'ChapterJump', chapter: 1 });
        case '2':
          return dispatch({ type: 'ChapterJump', chapter: 2 });
        case '3':
          return dispatch({ type: 'ChapterJump', chapter: 3 });
        case '4':
          return dispatch({ type: 'ChapterJump', chapter: 4 });
        case '5':
          return dispatch({ type: 'ChapterJump', chapter: 5 });
        case '6':
          return dispatch({ type: 'ChapterJump', chapter: 6 });
        case '7':
          return dispatch({ type: 'ChapterJump', chapter: 7 });
        case '8':
          return dispatch({ type: 'ChapterJump', chapter: 8 });
        case '9':
          return dispatch({ type: 'ChapterJump', chapter: 9 });
      }
    };
    window.onkeydown = e => {
      const { dispatch } = this.props.navigation;
      switch (e.code) {
        case 'ArrowLeft':
          return dispatch({ type: 'PrevSlide' });
        case 'ArrowRight':
          return dispatch({ type: 'NextSlide' });
      }
    };
  }
  render() {
    return <PresoSwitch navigation={this.props.navigation} />;
  }
}

function toggleFullScreen() {
  document.documentElement.webkitRequestFullScreen();
}

Presentation.navigationOptions = {
  title: 'Wow',
};

export default Presentation;
