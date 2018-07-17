import React from 'react';
import { StyleSheet, View, Text, Button, Image } from 'react-native';
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
import { Ionicons, FontAwesome } from '../react-navigation-icons';
import {
  createFluidNavigator,
  TransitionView,
} from '../react-navigation-fluid';

import {
  createSwitchNavigator,
  NavigationActions,
  SwitchRouter,
} from '../react-navigation-core';
import { createStaticContainer } from '../react-navigation-static-container';

import SyntaxHighlighter from 'react-syntax-highlighter/prism';
import { coy } from 'react-syntax-highlighter/styles/prism';
const queryString = require('query-string');

const styles = StyleSheet.create({
  hContain: {
    padding: 30,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

const SlideContainer = ({ children, color }) => (
  <View
    style={{
      width: 1280,
      height: 720,
      justifyContent: 'center',
      backgroundColor: color || 'white',
    }}
    children={children}
  />
);

const StyledText = props => (
  <Text
    {...props}
    style={[{ color: '#222' }, props.style, { fontFamily: 'PTSans' }]}
  />
);

const createLogoSlide = (IconsClass, icon, color, name) => ({ navigation }) => (
  <SlideContainer>
    <View
      style={{
        padding: 30,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <IconsClass size={200} name={icon} color={color} />
      <StyledText style={{ fontSize: 80, textAlign: 'center', color }}>
        {name}
      </StyledText>
    </View>
  </SlideContainer>
);

const createGithubSlide = name =>
  createLogoSlide(Ionicons, 'logo-github', '#24292e', name);
const createTwitterSlide = name =>
  createLogoSlide(Ionicons, 'logo-twitter', '#006dbf', name);
const createURLSlide = name =>
  createLogoSlide(FontAwesome, 'anchor', '#704d7f', name);

const NAV_COLOR = '#6b52ae';

const createReactNavSlide = title => ({ navigation }) => (
  <SlideContainer color={NAV_COLOR}>
    <View
      style={{
        padding: 30,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Image
        source={require('./navLogo.svg')}
        resizeMode="contain"
        style={{ height: 400, width: 400, marginBottom: 40 }}
      />
      <StyledText style={{ fontSize: 80, textAlign: 'center', color: 'white' }}>
        {title}
      </StyledText>
    </View>
  </SlideContainer>
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
            }}
          >
            <StyledText style={{ fontSize: 80, textAlign: 'center' }}>
              {title}
            </StyledText>
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
              <StyledText
                key={i}
                style={{
                  fontSize: 80,
                  marginVertical: 40,
                  textAlign: 'center',
                }}
              >
                {title}
              </StyledText>
            ))}
          </View>
        </SlideContainer>
      );
    }
  }
  return TitleSlide;
};

const CodeSlideCompanion = ({ Component, navigation }) => (
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
            }}
          >
            <SyntaxHighlighter
              customStyle={{ fontSize: 28 }}
              language="javascript"
              style={coy}
              highlighter={'prism' || 'hljs'}
            >
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

const RouteView = ({ route, isActive, isRoot, isBold }) => {
  const routes = route.routes && (
    <View style={{ padding: 10, flexDirection: 'row', flexWrap: 'wrap' }}>
      {route.routes.map((child, childIndex) => (
        <RouteView
          key={childIndex}
          route={child}
          isActive={childIndex === route.index && (isActive || isRoot)}
          isBold={childIndex === route.index}
        />
      ))}
    </View>
  );

  return (
    <View
      style={{
        backgroundColor: isActive ? '#0089' : '#1116',
        margin: 10,
      }}
    >
      {route.routeName && (
        <StyledText
          style={{
            color: 'white',
            fontSize: 32,
            margin: 20,
            fontWeight: isBold ? '400' : '300',
          }}
        >
          {route.routeName}
          {route.params ? `?${queryString.stringify(route.params)}` : ''}
        </StyledText>
      )}
      {routes}
    </View>
  );
};

const NavStateView = ({ state }) => {
  return <RouteView route={{ ...state, routeName: null }} isRoot={true} />;
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
            }}
          >
            <View
              style={{
                maxWidth: 820,
              }}
            >
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

const URLView = ({ url }) => (
  <View style={{ margin: 20 }}>
    {url && (
      <Text style={{ fontSize: 48 }}>
        my-app://{url.path}
        {url.params ? `?${queryString.stringify(url.params)}` : ''}
      </Text>
    )}
  </View>
);

// const SlideNavigator = createStateUrlSlide(App.router, {
//   path: 'Lesson',
//   params: { id: 'B' },
// });

const createStateUrlSlide = (exampleRouter, url, initAction) => {
  const urlAction = exampleRouter.getActionForPathAndParams(
    url.path,
    url.params || {},
  );

  class URLStateSlide extends React.Component {
    static router = {
      getStateForAction: (action, lastState) => {
        if (!lastState) {
          const exampleState = exampleRouter.getStateForAction(
            initAction || NavigationActions.init(),
          );
          return {
            ...exampleState,
            hasHandledURL: false,
          };
        }
        if (
          action.type === 'NextSlide' &&
          !lastState.hasHandledURL &&
          urlAction
        ) {
          const exampleState = exampleRouter.getStateForAction(
            urlAction,
            lastState,
          );
          return {
            ...exampleState,
            hasHandledURL: true,
          };
        }
        return lastState;
      },

      getPathAndParamsForState: state => ({ path: '', params: {} }),

      getActionForPathAndParams: (path, params) => null,
    };
    render() {
      const { state } = this.props.navigation;
      return (
        <SlideContainer>
          <View style={styles.hContain}>
            <URLView url={url} />
            <NavStateView state={state} />
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
    }}
  >
    <StyledText style={{ fontSize: 42, color: color, textAlign: 'center' }}>
      {title}
    </StyledText>
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
    }}
  >
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
      }}
    >
      {children}
    </View>
  </SlideContainer>
);

const preso = [];

preso.push(createMainTitleSlide('Full Stack React Navigation'));

preso.push(createReactNavSlide('React Navigation'));
preso.push(createReactNavSlide('v2'));
preso.push(createReactNavSlide('React Navigation'));

preso.push(createTitleSlide('Lets build an app!'));

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

preso.push(createTitleSlide('Demo'));

// App.js - Show implementation
// App.js - Wrap with switch and login
// realize not web-specific, show on web client
// server rendering
// investigate behavior on web

preso.push(createTitleSlide('Mobile URL Handling'));

preso.push(
  createCodeSlide(`
my-app://
`),
);

preso.push(
  createCodeSlide(`
my-app://HomeTab/Lesson?id=A
`),
);

preso.push(createTitleSlide('URLs open on fresh start'));

preso.push(
  createStateUrlSlide(StacksInTabs.router, {
    path: 'HomeTab/Lesson',
    params: { id: 'B' },
  }),
);

preso.push(createTitleSlide('URLs change state when app is open'));

preso.push(
  createStateUrlSlide(
    StacksInTabs.router,
    { path: 'OverviewTab/Lesson', params: { id: 'A' } },
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

preso.push(createTitleSlide('Navigation Routers'));

preso.push(createTitleSlide('Routers have navigation state reducers!'));

preso.push(createCodeSlide(`router.getStateForAction(action, lastState)`));

preso.push(createTitleSlide('Routers also define URL behavior'));

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
    const { state } = this.props.navigation;
    return <Something state={state} />;
  }

}
`),
);

preso.push(
  createCodeSlide(`
class CustomNavigator extends React.Component {

  static router = {...};

  render() {
    const { state } = this.props.navigation;
    return <Something state={state} />;
  }
}
`),
);

preso.push(
  createCodeSlide(`
const router = {
  getStateForAction(action, lastState) {
    if (action.type === 'MyAction') {
      // custom navigation logic here
    }
    return lastState || INIT_STATE;
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

preso.push(
  createCodeSlide(`
const router = {
  ...MyNavigator.router,
  getStateForAction(action, lastState) {
    if (action.type === 'MyAction') {
      // custom navigation logic here
    }
    return MyNavigator.router.getStateForAction(action, lastState);
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

preso.push(createTitleSlide('Demo'));
preso.push(createTitleSlide('This is it!'));

preso.push(
  createStateUrlSlide(StacksInTabs.router, {
    path: 'Lesson',
    params: { id: 'B' },
  }),
);

preso.push(createGithubSlide('react-navigation'));

preso.push(createTwitterSlide('@reactnavigation'));

preso.push(createURLSlide('reactnavigation.org'));

preso.push(createTitleSlide('Community Navigators'));

preso.push(createGithubSlide('fram-x/FluidTransitions')); // christian falch

preso.push(createTitleSlide('Demo'));

preso.push(createTitleSlide('Community Navigators'));

preso.push(createTitleSlide('Demo'));

preso.push(createGithubSlide('AvenCloud/globe'));
preso.push(createTwitterSlide('@ericvicenti'));
preso.push(createURLSlide('aven.io'));

preso.push(createReactNavSlide(''));
preso.push(createReactNavSlide('Thank you!'));

const slideRouteConfigs = {};
preso.forEach((slide, slideIndex) => {
  slide.index = slideIndex;
  slideRouteConfigs[`Slide${slideIndex}`] = slide;
});

const PresoNavigator = createSwitchNavigator(slideRouteConfigs);

const PresoRouter = {
  ...PresoNavigator.router,
  getStateForAction(action, lastState) {
    if (lastState) {
      const activeRoute = lastState.routes[lastState.index];
      const childComponent =
        activeRoute.routeName &&
        PresoNavigator.router.getComponentForRouteName(activeRoute.routeName);
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
      return PresoNavigator.router.getStateForAction(nextAction, lastState);
    }
    if (action.type === 'PrevSlide') {
      const prevAction = NavigationActions.navigate({
        routeName: `Slide${lastState.index - 1}`,
      });
      console.log(prevAction);
      return PresoNavigator.router.getStateForAction(prevAction, lastState);
    }
    if (action.type === 'ResetSlide') {
      return PresoNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'Slide0' }),
        lastState,
      );
    }

    if (action.type === 'ChapterJump') {
      // todo
    }

    return PresoNavigator.router.getStateForAction(action, lastState);
  },
  getScreenOptions(childNavigation) {
    return {
      ...PresoNavigator.router.getScreenOptions(childNavigation),
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
    return <PresoNavigator navigation={this.props.navigation} />;
  }
}

function toggleFullScreen() {
  document.documentElement.webkitRequestFullScreen();
}

Presentation.navigationOptions = {
  title: 'Wow',
};

export default Presentation;
