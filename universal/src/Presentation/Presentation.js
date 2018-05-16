import React from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { Home, Overview, Lesson, Login } from '../App/TestScreens';
import {
  FullApp,
  BasicSwitch,
  BasicStack,
  StackWithPushBug,
  StackWithPushBug2,
  StackInSwitch,
  StacksInTabs,
} from '../App/DemoNavigators';

import {
  createSwitchNavigator,
  NavigationActions,
} from '../react-navigation-core';
import { createStaticContainer } from '../react-navigation-static-container';

import SyntaxHighlighter from 'react-syntax-highlighter/prism';
import { coy } from 'react-syntax-highlighter/styles/prism';
const queryString = require('query-string');

const SlideContainer = ({ children }) => (
  <View
    style={{
      width: 1280,
      height: 720,
      borderColor: '#eee',
      borderWidth: 20,
      justifyContent: 'center',
    }}
    children={children}
  />
);

const createTitleSlide = title => {
  class TitleSlide extends React.Component {
    render() {
      return (
        <SlideContainer>
          <View
            style={{
              padding: 30,
              justifyContent: 'center',
            }}>
            <Text style={{ fontSize: 80, textAlign: 'center' }}>{title}</Text>
          </View>
        </SlideContainer>
      );
    }
  }
  return TitleSlide;
};

const createMultiTitleSlide = titles => {
  class TitleSlide extends React.Component {
    render() {
      return (
        <SlideContainer>
          <View style={{ padding: 30, justifyContent: 'center' }}>
            {titles.map((title, i) => (
              <Text
                key={i}
                style={{
                  fontSize: 80,
                  marginVertical: 40,
                  textAlign: 'center',
                }}>
                {title}
              </Text>
            ))}
          </View>
        </SlideContainer>
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
  class CodeSlide extends React.Component {
    static router = opts && opts.Component && opts.Component.router;
    render() {
      return (
        <SlideContainer>
          <View
            style={{
              padding: 30,
              justifyContent: 'space-between',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <SyntaxHighlighter
              customStyle={{ fontSize: 28 }}
              language="javascript"
              style={coy}
              highlighter={'prism' || 'hljs'}>
              {codeString}
            </SyntaxHighlighter>
            {opts && <CodeSlideCompanion {...this.props} {...opts} />}
          </View>
        </SlideContainer>
      );
    }
  }
  return CodeSlide;
};

const RouteView = ({ route, isActive, isBold }) => {
  const routes = route.routes && (
    <View style={{ padding: 10, flexDirection: 'row', flexWrap: 'wrap' }}>
      {route.routes.map((child, childIndex) => (
        <RouteView
          key={childIndex}
          route={child}
          isActive={childIndex === route.index && isActive}
          isBold={childIndex === route.index}
        />
      ))}
    </View>
  );

  return (
    <View
      style={{
        backgroundColor: isActive ? '#1156' : '#1115',
        margin: 10,
      }}>
      {route.routeName && (
        <Text
          style={{
            color: 'white',
            fontSize: 32,
            margin: 20,
            fontWeight: isBold ? '400' : '300',
          }}>
          {route.routeName}
          {route.params ? `?${queryString.stringify(route.params)}` : ''}
        </Text>
      )}
      {routes}
    </View>
  );
};

const NavStateView = ({ state }) => {
  return <RouteView route={{ ...state, routeName: null }} isActive={true} />;
};

const createStateSlide = opts => {
  const WrappedComponent = opts.Component;

  class StateSlide extends React.Component {
    static router = WrappedComponent.router;
    render() {
      return (
        <SlideContainer>
          <View
            style={{
              padding: 30,
              justifyContent: 'space-between',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <View
              style={{
                maxWidth: 820,
              }}>
              <NavStateView state={this.props.navigation.state} />
            </View>
            {opts && <CodeSlideCompanion {...this.props} {...opts} />}
          </View>
        </SlideContainer>
      );
    }
  }
  return StateSlide;
};

const createStateUrlSlide = (router, urls, initAction) => {
  initAction = initAction || NavigationActions.init();
  const urlActions = urls.map(({ path, params }) => {
    return router.getActionForPathAndParams(path, params || {});
  });

  class URLStateSlide extends React.Component {
    static router = {
      getStateForAction(action, lastState) {
        if (!lastState) {
          const routerState = router.getStateForAction(initAction);
          return {
            ...routerState,
            actionIndex: 0,
          };
        }
        if (action.type === 'NextSlide') {
          if (lastState.actionIndex < urlActions.length) {
            const urlAction = urlActions[lastState.actionIndex];
            return {
              ...router.getStateForAction(urlAction, lastState),
              actionIndex: lastState.actionIndex + 1,
            };
          }
        }
        return lastState;
      },
      getPathAndParamsForState() {
        return { path: '', params: {} };
      },
      getActionForPathAndParams: () => null,
    };
    render() {
      const { actionIndex } = this.props.navigation.state;
      const url = urls[0];
      return (
        <SlideContainer>
          <View
            style={{
              padding: 30,
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <View style={{ margin: 20 }}>
              {url && (
                <Text style={{ fontSize: 48 }}>
                  my-app://{url.path}
                  {url.params ? `?${queryString.stringify(url.params)}` : ''}
                </Text>
              )}
            </View>
            <NavStateView state={this.props.navigation.state} />
          </View>
        </SlideContainer>
      );
    }
  }
  return URLStateSlide;
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
    <PhonesDemoSlide>
      <PhoneView>
        <App navigation={navigation} />
      </PhoneView>
    </PhonesDemoSlide>
  );
  DemoSlide.router = App.router;
  return DemoSlide;
};

const createStaticDemoSlide = DemoApps => {
  const StaticDemos = DemoApps.map(DemoApp => createStaticContainer(DemoApp));
  const DemoSlide = () => (
    <PhonesDemoSlide>
      {StaticDemos.map((StaticDemo, i) => (
        <PhoneView key={i}>
          <StaticDemo />
        </PhoneView>
      ))}
    </PhonesDemoSlide>
  );
  return DemoSlide;
};

const PhoneView = ({ children }) => (
  <View
    style={{
      backgroundColor: 'black',
      paddingVertical: 50,
      borderRadius: 40,
      paddingHorizontal: 10,
      height: 640,
      width: 320,
    }}>
    <View
      style={{
        flex: 1,
        backgroundColor: 'white',
        overflow: 'hidden',
      }}
      children={children}
    />
  </View>
);
const PhonesDemoSlide = ({ children }) => (
  <SlideContainer>
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}>
      {children}
    </View>
  </SlideContainer>
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

preso.push(createStaticDemoSlide([Login, Home, Lesson]));

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
import {
  createSwitchNavigator
} from 'react-navigation';

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
import {
  createSwitchNavigator
} from 'react-navigation';

const App = createSwitchNavigator({
  Login,
  Home,
});
`,
    { Component: Login },
  ),
);

preso.push(
  createCodeSlide(
    `
import {
  createSwitchNavigator
} from 'react-navigation';

const App = createSwitchNavigator({
  Login,
  Home,
}, {
  initialRouteName: 'Login'
});
`,
    { Component: Login },
  ),
);

preso.push(
  createCodeSlide(
    `
class LoginScreen {

  handleLoginSuccess() {
    this.props.navigation.navigate('Home');
  }

  ...
}
`,
    { Component: BasicSwitch },
  ),
);

preso.push(createStateSlide({ Component: BasicSwitch }));

// BasicSwitch

preso.push(createTitleSlide('Stack Navigator'));

preso.push(
  createCodeSlide(
    `
import {
  createStackNavigator
} from 'react-navigation';

const App = createStackNavigator({
  Home,
  Lesson,
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
    this.props.navigation.navigate(
      'Lesson',
      { id: 'A' }
    );
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
    const lessonID =
      this.props.navigation.getParam('id');
    ...
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
    headerTitle:
      \`Lesson \${navigation.getParam('id')}\`
  });

  ...
}
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
    this.props.navigation.navigate(
      'Lesson',
      { id: 'A' }
    );
  }

  ...
}
`,
    { Component: StackWithPushBug },
  ),
);

preso.push(createStateSlide({ Component: StackWithPushBug }));

preso.push(
  createCodeSlide(
    `
class LessonScreen extends React.Component {

  onOpenLessonA() {
    this.props.navigation.push(
      'Lesson',
      { id: 'A' }
    );
  }

  ...
}
`,
    { Component: StackWithPushBug2 },
  ),
);

preso.push(createStateSlide({ Component: StackWithPushBug2 }));

preso.push(
  createCodeSlide(
    `
class LessonScreen extends React.Component {

  onOpenLessonA() {
    this.props.navigation.navigate({
      routeName: 'Lesson',
      params: { id: 'A' },
      key: 'LessonA',
    });
  }

  ...
}
`,
    { Component: BasicStack },
  ),
);

preso.push(createStateSlide({ Component: BasicStack }));

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
  Login,
  Main: createStackNavigator({
    Home,
    Lesson,
  }),
});
`,
    { Component: StackInSwitch },
  ),
);

preso.push(createStateSlide({ Component: StackInSwitch }));

preso.push(createTitleSlide('Tab Navigator'));

preso.push(
  createCodeSlide(
    `
const App = createBottomTabNavigator({
  HomeTab: createStackNavigator({
    Home,
    Lesson,
  }),
  OverviewTab: createStackNavigator({
    Overview,
    Lesson,
  }),
  SettingsTab: ...
});
`,
    { Component: StacksInTabs },
  ),
);
preso.push(createStateSlide({ Component: StacksInTabs }));

preso.push(createTitleSlide('Custom Navigators'));

preso.push(
  createCodeSlide(`
  const App = createSwitchNavigator({
    Login,
    Main,
  });
  `),
);
preso.push(
  createCodeSlide(`
  const App = createSwitchNavigator({
    Login,
    Main: CustomNavigator,
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

  render() {
    const {navigation} = this.props;
    return <MainNavigator navigation={navigation} />;
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

preso.push(createTitleSlide('Composition Demo'));

// at this time, show login sub-app installation

// wait, nothing here is RN specific, it could run on web?

// navigation behavior feels like mobile app still..

// preso.push(createTitleSlide('Navigation Actions'));

// preso.push(
//   createCodeSlide(`
// NavigationActions.navigate({
//   routeName: 'OverviewTab'
// });
// `),
// );

// preso.push(
//   createCodeSlide(`
// this.props.navigation.dispatch(
//   NavigationActions.navigate({
//     routeName: 'OverviewTab'
//   })
// );
// `),
// );

// preso.push(
//   createCodeSlide(`
// this.props.navigation.navigate('OverviewTab');
// `),
// );

// preso.push(createTitleSlide('How Routers work'));

// preso.push(
//   createCodeSlide(`
// const action = NavigationActions.navigate({
//   routeName: 'OverviewTab'
// });
// `),
// );

// preso.push(
//   createCodeSlide(`
// const App = createSwitchNavigator({
//   LoginRoute: LoginScreen,
//   MainRoute: createTabNavigator({
//     HomeTab: HomeStackNavigator,
//     OverviewTab: OverviewStackNavigator,
//   }),
// });
// `),
// );

// preso.push(
//   createCodeSlide(`
// App.router
// `),
// );
// preso.push(
//   createCodeSlide(`
// App.router.getStateForAction(action, lastState);
// `),
// );
// preso.push(
//   createCodeSlide(`
// state = App.router.getStateForAction(action, lastState);
// `),
// );

preso.push(createTitleSlide('Mobile URL Handling'));

preso.push(
  createCodeSlide(`
my-app://
`),
);

preso.push(
  createCodeSlide(`
my-app://Login
`),
);

preso.push(
  createCodeSlide(`
my-app://HomeTab/Lesson
`),
);

preso.push(
  createCodeSlide(`
my-app://HomeTab/Lesson?id=A
`),
);

preso.push(createTitleSlide('URLs open on cold start'));

preso.push(
  createStateUrlSlide(StacksInTabs.router, [
    { path: 'HomeTab/Lesson', params: { id: 'B' } },
  ]),
);

preso.push(createTitleSlide('URLs change state when app is open'));

preso.push(
  createStateUrlSlide(
    StacksInTabs.router,
    [{ path: 'OverviewTab/Lesson', params: { id: 'A' } }],
    NavigationActions.navigate({
      routeName: 'HomeTab',
      action: NavigationActions.navigate({
        routeName: 'Lesson',
        params: { id: 'B' },
      }),
    }),
  ),
);

preso.push(createMultiTitleSlide(['URLs change the state']));
preso.push(
  createMultiTitleSlide(['URLs change the state,', "they don't define it"]),
);

preso.push(createTitleSlide('URLs are actions!'));
preso.push(createMultiTitleSlide(['URLs']));
preso.push(createMultiTitleSlide(['URLs', 'are']));
preso.push(createMultiTitleSlide(['URLs', 'are', 'actions!']));
preso.push(createMultiTitleSlide(['URLs are navigation actions!']));
preso.push(
  createMultiTitleSlide([
    'URLs are navigation actions!',
    ',NOT navigation state',
  ]),
);

preso.push(createTitleSlide('Navigation Actions'));

preso.push(
  createCodeSlide(`
NavigationActions.navigate({
  routeName: 'Lesson',
  params: {id: 'B'},
});
`),
);

preso.push(
  createCodeSlide(`
{
  type: 'Navigation/Navigate',
  routeName: 'Lesson',
  params: {id: 'B'},
}
`),
);

preso.push(
  createCodeSlide(`
this.props.navigation.dispatch(
  NavigationActions.navigate({
    routeName: 'Lesson'
    params: {id: 'B'},
  })
);
`),
);

preso.push(
  createCodeSlide(`
this.props.navigation.navigate(
  'Lesson',
  {id: 'B'}
);
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

preso.push(createTitleSlide('Routers manage navigation state'));

preso.push(createTitleSlide('Routers have navigation state reducers!'));

preso.push(createCodeSlide(`router.getStateForAction(action, lastState)`));

preso.push(createTitleSlide('Routers define navigation state behavior'));

preso.push(createTitleSlide('Routers also define URL behavior'));

preso.push(createTitleSlide('Demo Sassy Login'));
preso.push(createTitleSlide('Demo Web Layout'));

preso.push(createTitleSlide('Community Navigators & Routers'));
preso.push(
  createTitleSlide('https://github.com/react-navigation/react-navigation-tabs'),
);

preso.push(
  createMultiTitleSlide(['https://github.com/fram-x/FluidTransitions']),
);

preso.push(createMultiTitleSlide(['github.com/ericvicenti/universe']));
preso.push(createMultiTitleSlide(['reactnavigation.org', '@reactnavigation']));

preso.push(createMultiTitleSlide(['@ericvicenti']));

preso.push(createTitleSlide('Go forth, navigate on every platform,'));

const slideRouteConfigs = {};
preso.forEach((slide, slideIndex) => {
  slide.index = slideIndex;
  slideRouteConfigs[`Slide${slideIndex}`] = slide;
});

const PresoSwitch = createSwitchNavigator(slideRouteConfigs);

const PresoRouter = {
  ...PresoSwitch.router,
  getStateForAction(action, lastState) {
    if (lastState) {
      const activeRoute = lastState.routes[lastState.index];
      const childComponent =
        activeRoute.routeName &&
        PresoSwitch.router.getComponentForRouteName(activeRoute.routeName);
      const childRouter = childComponent && childComponent.router;
      const newRoute =
        childRouter && childRouter.getStateForAction(action, activeRoute);
      if (newRoute && newRoute !== activeRoute) {
        const routes = [...lastState.routes];
        routes[lastState.index] = newRoute;
        return {
          ...lastState,
          routes,
        };
      }
    }

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
        case 'PageUp':
          return dispatch({ type: 'PrevSlide' });
        case 'ArrowRight':
        case 'PageDown':
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
