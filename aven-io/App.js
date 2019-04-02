import {
  View,
  Text,
  Image,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
} from 'react-native';
import React, { useState } from 'react';

import SwitchRouter from '../navigation-core/routers/SwitchRouter';
import SceneView from '../navigation-core/views/SceneView';
import getActiveChildNavigationOptions from '../navigation-core/utils/getActiveChildNavigationOptions';
import createNavigator from '../navigation-core/navigators/createNavigator';
import useCloud from '../cloud-core/useCloud';
import useCloudValue from '../cloud-core/useCloudValue';
import useCloudReducer from '../cloud-core/useCloudReducer';
import Link from '../navigation-web/Link';
import uuid from 'uuid/v1';
import Konva from 'konva';
import {
  mainShade,
  mainShadeLight,
  titleFontFamily,
  mainShadeTint,
  shadowBorderColor,
  shadowStyle,
} from './DocViews';

import {
  Stage,
  Layer,
  Rect,
  Text as KonvaText,
  Circle,
  Line,
} from 'react-konva';

process.env.REACT_NAV_LOGGING = true;

function HeaderLink({ title, icon, ...props }) {
  return (
    <Link
      {...props}
      overrideATagCSS={{ display: 'flex' }}
      renderContent={isSelected => (
        <View
          style={{
            backgroundColor: isSelected ? mainShadeTint : '#fff',
            alignSelf: 'stretch',
            padding: 10,
            paddingHorizontal: 20,
            justifyContent: 'center',
          }}
        >
          {title && (
            <Text
              style={{
                fontSize: 22,
                color: isSelected ? mainShade : '#2c2c2c',
              }}
            >
              {title}
            </Text>
          )}
          {icon && <Image source={icon} style={{ width: 36, height: 36 }} />}
        </View>
      )}
    />
  );
}

function Header() {
  return (
    <View
      style={{
        zIndex: 100,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        ...shadowStyle,
        height: 70,
        flexDirection: 'row',
      }}
    >
      <Link
        routeName="Home"
        overrideATagCSS={{ display: 'flex', flexGrow: 1, alignSelf: 'stretch' }}
      >
        <View style={{ flexDirection: 'row', alignSelf: 'stretch' }}>
          <Image
            source={require('./assets/AvenLogo.svg')}
            style={{
              marginHorizontal: 20,
              alignSelf: 'center',
              width: 452 / 3,
              height: 100 / 3,
            }}
          />
          <Text
            style={{
              color: mainShade,
              fontSize: 36,
              alignSelf: 'center',
              fontFamily: titleFontFamily,
            }}
          >
            Cloud
          </Text>
        </View>
      </Link>
      <View style={{ flex: 1 }} />
      <HeaderLink title="Docs" routeName="Docs" />
      <HeaderLink title="About" routeName="About" />
      <HeaderLink
        url="https://github.com/AvenCloud/Aven"
        icon={require('./assets/Github.png')}
      />
      <HeaderLink
        url="https://twitter.com/Aven_Cloud"
        icon={require('./assets/Twitter.png')}
      />
    </View>
  );
}

const AppView = ({ navigation, descriptors }) => {
  const { state } = navigation;
  const route = state.routes[state.index];
  const descriptor = descriptors[route.key];
  return (
    <View style={{ flex: 1 }}>
      <Header descriptors={descriptors} navigation={navigation} />
      <SceneView
        component={descriptor.getComponent()}
        navigation={descriptor.navigation}
      />
    </View>
  );
};

// function TodoItem({ item }) {
//   return <Text>{item.label}</Text>;
// }

// function TodoList() {
//   const cloud = useCloud();
//   const todosDoc = cloud.get('todos');
//   const todos = useCloudValue(todosDoc);
//   if (!todos || todos.length === 0) {
//     return <Text>Nothing to do!</Text>;
//   }
//   return todos.map(item => <TodoItem item={item} key={item.key} />);
// }

// function AddTodo() {
//   const cloud = useCloud();
//   const todosDoc = cloud.get('todos');
//   const todos = useCloudValue(todosDoc);
//   const [newTodoText, setNewTodoText] = useState('');
//   return (
//     <TextInput
//       style={{
//         width: 400,
//         borderWidth: 1,
//         borderColor: '#ccc',
//         borderRadius: 5,
//       }}
//       onSubmitEditing={() => {
//         todosDoc.put([...(todos || []), { label: newTodoText, key: uuid() }]);
//       }}
//       onChangeText={setNewTodoText}
//       value={newTodoText}
//     />
//   );
// }

const reduceStatusDisplayState = `
  if (!action) {
    return state;
  }
  if (action.type === 'AddTodo') {
    return [
      ...state,
      action.todo,
    ];
  }
  if (action.type === 'RemoveTodo') {
    return state.filter(item => item.key !== action.key);
  }
  return state;
`;

function useTodosTransactional() {
  return useCloudReducer('todosTransactional', reduceStatusDisplayState, []);
}

function TodoItem({ item }) {
  const [, dispatch] = useTodosTransactional();
  return (
    <View>
      <Text>{item.label}</Text>
      <Button
        onPress={() => {
          dispatch({ type: 'RemoveTodo', key: item.key });
        }}
        title="remove"
      />
    </View>
  );
}

function TodoList() {
  const [todos] = useTodosTransactional();
  if (todos === null) {
    return null;
  }
  if (!todos || todos.length === 0) {
    return <Text>Nothing to do!</Text>;
  }
  return todos.map(item => <TodoItem item={item} key={item.key} />);
}

function AddTodo() {
  const [_, dispatch] = useTodosTransactional();
  const [newTodoText, setNewTodoText] = useState('');
  return (
    <TextInput
      style={{
        width: 400,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
      }}
      onSubmitEditing={() => {
        setNewTodoText('');
        dispatch({
          type: 'AddTodo',
          todo: { label: newTodoText, key: uuid() },
        });
      }}
      onChangeText={setNewTodoText}
      value={newTodoText}
    />
  );
}

function Home() {
  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ alignItems: 'center' }}>
        <Image
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
          resizeMode="cover"
          source={require('./assets/cloudGlamour.png')}
        />
        <View
          style={{
            flex: 1,
            alignSelf: 'stretch',
          }}
        >
          <View
            style={{
              flex: 1,
              width: 600,
              alignSelf: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 36,
                margin: 50,
                fontFamily: titleFontFamily,
                color: mainShade,
              }}
            >
              Introducing Aven Cloud
            </Text>
            <Text style={{ fontSize: 32, margin: 50, color: mainShadeLight }}>
              A Full-Stack Database Framework for JS Apps
            </Text>
            <View
              style={{
                marginVertical: 80,
                backgroundColor: 'white',
                padding: 50,
                minHeight: 200,
                alignSelf: 'stretch',
                ...shadowStyle,
              }}
            />
          </View>
        </View>
      </View>
      <View style={{}}>
        <Text style={{ fontSize: 36, margin: 50 }}>
          Store Data - To PostgreSQL or the File System
        </Text>
        <Text style={{ fontSize: 36, margin: 50 }}>
          Serve and Recieve Data - Over HTTP + WebSockets
        </Text>
        <Text style={{ fontSize: 36, margin: 50 }}>
          Protect Data - With Authentication and Permission APIs
        </Text>
        <Text style={{ fontSize: 36, margin: 50 }}>
          Connect App - Use a client and utilities for React
        </Text>
        <Text style={{ fontSize: 36, margin: 50 }}>
          Compute Data - Save pure functions to compute and cache
        </Text>
      </View>
      <View style={{}}>
        <Image
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
          resizeMode="cover"
          source={require('./assets/cloudGlamour.png')}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 36, margin: 50 }}>
            About Aven - What we believe, and who "we" are
          </Text>
          <Text style={{ fontSize: 36, margin: 50 }}>
            Liberal Open Source - Licensed under Apache 2
          </Text>
          <Text style={{ fontSize: 36, margin: 50 }}>
            Documentation - Constantly under improvement
          </Text>
          <Text style={{ fontSize: 36, margin: 50 }}>
            Contributors - Help Wanted!
          </Text>
          <Text style={{ fontSize: 36, margin: 50 }}>
            Compute Data - Use pure functions to compute and cache
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
function OldHome() {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 42 }}>Preview Only</Text>
      <Stage width={600} height={600}>
        <Layer>
          <KonvaText text="Some text on canvas" fontSize={15} />
          <Rect
            x={20}
            y={50}
            width={100}
            height={100}
            fill="red"
            shadowBlur={10}
          />
          <Circle x={200} y={100} radius={50} fill="green" />
          <Line
            x={20}
            y={200}
            points={[0, 150, 100, 0, 100, 100]}
            tension={0.8}
            closed
            stroke="black"
            fillLinearGradientStartPoint={{ x: -50, y: -50 }}
            fillLinearGradientEndPoint={{ x: 50, y: 50 }}
            fillLinearGradientColorStops={[0, 'red', 1, 'yellow']}
          />
        </Layer>
      </Stage>
    </View>
  );
}

const DocsRouter = SwitchRouter({
  DocsOverview: require('./docs/Aven-Overview').default,
  QuickStart: require('./docs/QuickStart').default,
  Tutorial1: require('./docs/1-Data-Sources').default,
  Tutorial2: require('./docs/2-Connect-React').default,
  Tutorial3: require('./docs/3-Authentication').default,
  ToolsEnvs: require('./docs/ToolsEnvironments').default,
  'API-createCloudClient': require('./docs/API-createCloudClient').default,
  'API-CloudBlock': require('./docs/API-CloudBlock').default,
  'API-CloudDoc': require('./docs/API-CloudDoc').default,
  'API-CloudValue': require('./docs/API-CloudValue').default,
  'API-createSMSAuthProvider': require('./docs/API-createSMSAuthProvider')
    .default,
  'API-createEmailAuthProvider': require('./docs/API-createEmailAuthProvider')
    .default,
  'API-createProtectedSource': require('./docs/API-createProtectedSource')
    .default,
  'API-startSourceServer': require('./docs/API-startSourceServer').default,
  'API-createMemoryStorageSource': require('./docs/API-createMemoryStorageSource')
    .default,
  'API-startFSStorageSource': require('./docs/API-startFSStorageSource')
    .default,
  'API-startPostgresStorageSource': require('./docs/API-startPostgresStorageSource')
    .default,
  'API-createBrowserNetworkSource': require('./docs/API-createBrowserNetworkSource')
    .default,
  'API-createNodeNetworkSource': require('./docs/API-createNodeNetworkSource')
    .default,
  'API-createNativeNetworkSource': require('./docs/API-createNativeNetworkSource')
    .default,
  ObservableUsage: require('./docs/ObservableUsage').default,
  CloudReactHooks: require('./docs/CloudReactHooks').default,
  Sources: require('./docs/Sources').default,
  CloudClientIntro: require('./docs/CloudClientIntro').default,
  CloudSchema: require('./docs/CloudSchema').default,
  GarbageCollection: require('./docs/GarbageCollection').default,
  AuthIntro: require('./docs/AuthIntro').default,
  Roadmap: require('./docs/Roadmap').default,
  Contributors: require('./docs/Contributors').default,
  DocPermissions: require('./docs/DocPermissions').default,
  'Spec-ProtectedSource': require('./docs/Spec-ProtectedSource').default,
  'Spec-AuthProvider': require('./docs/Spec-AuthProvider').default,
  'Spec-Source': require('./docs/Spec-Source').default,
});

function SidebarSection({ title, children }) {
  const marginHeight = 50;
  const marginOffset = 150;
  return (
    <View
      style={{
        // borderBottomWidth: 1,
        // borderBottomColor: '#ddd',
        paddingBottom: 20,
      }}
    >
      <View
        style={{
          alignSelf: 'stretch',
          height: marginHeight,
          overflow: 'hidden',
        }}
      >
        <Image
          resizeMode="cover"
          style={{
            height: marginOffset,
            top: marginHeight - marginOffset,
            alignSelf: 'stretch',
          }}
          source={require('./assets/cloudGlamour.png')}
        />
      </View>
      <Text
        style={{
          color: mainShadeLight,
          fontFamily: titleFontFamily,
          fontSize: 28,
          paddingTop: 20,
          paddingBottom: 10,
          paddingHorizontal: 20,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}
function SidebarLink({ title, routeName }) {
  return (
    <Link
      routeName={routeName}
      renderContent={isActive => (
        <View
          style={{
            backgroundColor: isActive ? mainShade : undefined,
            paddingHorizontal: 20,
            paddingVertical: 8,
          }}
        >
          <Text
            style={{
              color: isActive ? 'white' : '#2c2c2c',
              fontSize: 17,
            }}
          >
            {title}
          </Text>
        </View>
      )}
    />
  );
}
function Sidebar() {
  return (
    <ScrollView
      style={{
        flex: 1,
        maxWidth: 360,
        backgroundColor: '#f8f8f8',
        ...shadowStyle,
        borderRightColor: shadowBorderColor,
        borderRightWidth: StyleSheet.hairlineWidth,
      }}
    >
      <View style={{ marginTop: 0 }}>
        <SidebarSection title="Getting Started">
          <SidebarLink title="Quick Start" routeName="QuickStart" />
          <SidebarLink
            title="1. Creating Sources and Clients"
            routeName="Tutorial1"
          />
          <SidebarLink title="2. Connect React" routeName="Tutorial2" />
          <SidebarLink title="3. Authentication" routeName="Tutorial3" />
        </SidebarSection>
        <SidebarSection title="Data & Network Sources">
          <SidebarLink title="Intro to Sources" routeName="Sources" />
          <SidebarLink
            title="API: createMemoryStorageSource"
            routeName="API-createMemoryStorageSource"
          />
          <SidebarLink
            title="API: startFSStorageSource"
            routeName="API-startFSStorageSource"
          />
          <SidebarLink
            title="API: startPostgresStorageSource"
            routeName="API-startPostgresStorageSource"
          />
          <SidebarLink
            title="API: startSourceServer"
            routeName="API-startSourceServer"
          />
          <SidebarLink
            title="API: createBrowserNetworkSource"
            routeName="API-createBrowserNetworkSource"
          />
          <SidebarLink
            title="API: createNodeNetworkSource"
            routeName="API-createNodeNetworkSource"
          />
          <SidebarLink
            title="API: createNativeNetworkSource"
            routeName="API-createNativeNetworkSource"
          />
          <SidebarLink title="SPEC: Data Source" routeName="Spec-Source" />
        </SidebarSection>
        <SidebarSection title="Cloud Client">
          <SidebarLink
            title="Intro to Cloud Client"
            routeName="CloudClientIntro"
          />
          <SidebarLink
            title="Observables with Cloud and React"
            routeName="ObservableUsage"
          />
          <SidebarLink title="Cloud React Hooks" routeName="CloudReactHooks" />
          <SidebarLink
            title="API: createCloudClient"
            routeName="API-createCloudClient"
          />
          <SidebarLink title="API: Client Value" routeName="API-CloudValue" />
          <SidebarLink title="API: Client Doc" routeName="API-CloudDoc" />
          <SidebarLink title="API: Client Block" routeName="API-CloudBlock" />
        </SidebarSection>
        <SidebarSection title="Auth & Permissions">
          <SidebarLink title="Auth and Auth Methods" routeName="AuthIntro" />
          <SidebarLink title="Doc Permissions" routeName="DocPermissions" />
          <SidebarLink
            title="API: createProtectedSource"
            routeName="API-createProtectedSource"
          />
          <SidebarLink
            title="API: createEmailAuthProvider"
            routeName="API-createEmailAuthProvider"
          />
          <SidebarLink
            title="API: createSMSAuthProvider"
            routeName="API-createSMSAuthProvider"
          />
          <SidebarLink
            title="Spec: Auth Data Source"
            routeName="Spec-ProtectedSource"
          />
          <SidebarLink
            title="Spec: Auth Provider"
            routeName="Spec-AuthProvider"
          />
        </SidebarSection>
        <SidebarSection title="Advanced">
          <SidebarLink title="Schemas" routeName="CloudSchema" />
          <SidebarLink
            title="Garbage Collection"
            routeName="GarbageCollection"
          />
        </SidebarSection>
        <SidebarSection title="Community">
          <SidebarLink title="Tooling and Environments" routeName="ToolsEnvs" />
          <SidebarLink title="About Aven" routeName="About" />
          <SidebarLink title="Roadmap" routeName="Roadmap" />
          <SidebarLink title="Contributors" routeName="Contributors" />
        </SidebarSection>
      </View>
    </ScrollView>
  );
}

function SidebarView({ navigation, descriptors }) {
  const { state } = navigation;
  const route = state.routes[state.index];
  const descriptor = descriptors[route.key];
  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <Sidebar descriptors={descriptors} navigation={navigation} />
      <SceneView
        component={descriptor.getComponent()}
        navigation={descriptor.navigation}
      />
    </View>
  );
}

const Docs = createNavigator(SidebarView, DocsRouter, {});

const AppRouter = SwitchRouter({
  Home: {
    screen: Home,
    path: '',
    navigationOptions: {
      title: 'Aven',
    },
  },
  About: {
    screen: require('./docs/About').default,
    path: 'about',
  },
  Docs: {
    screen: Docs,
    path: 'docs',
    params: {},
    navigationOptions: ({ navigation, screenProps }) => ({
      title:
        getActiveChildNavigationOptions(navigation, screenProps).title +
        ' - Aven Docs',
    }),
  },
});

const AppNavigator = createNavigator(AppView, AppRouter, {});

export default AppNavigator;
