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
  Stage,
  Layer,
  Rect,
  Text as KonvaText,
  Circle,
  Line,
} from 'react-konva';

process.env.REACT_NAV_LOGGING = true;

const shadow = {
  shadowOffset: { width: 0, height: 0 },
  shadowColor: 'black',
  shadowOpacity: 0.06,
  shadowRadius: 11,
};
const shadowBorderColor = '#d8d8d8';

function HeaderLink({ title, ...props }) {
  return (
    <Link
      {...props}
      overrideATagCSS={{ display: 'flex' }}
      renderContent={isSelected => (
        <View
          style={{
            backgroundColor: isSelected ? '#ddf' : '#fff',
            alignSelf: 'stretch',
            padding: 20,
          }}
        >
          <Text style={{ fontSize: 22, color: isSelected ? 'black' : '#222' }}>
            {title}
          </Text>
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
        ...shadow,
        height: 70,
        flexDirection: 'row',
      }}
    >
      <Image
        source={require('./assets/AvenLogo.svg')}
        style={{
          marginHorizontal: 20,
          alignSelf: 'center',
          width: 452 / 3,
          height: 100 / 3,
        }}
      />
      <View style={{ flex: 1 }} />
      <HeaderLink title="Home" routeName="Home" />
      <HeaderLink title="Docs" routeName="Docs" />
      <HeaderLink title="About" routeName="About" />
      <HeaderLink title="Github" url="https://github.com/AvenCloud/Aven" />
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
  'API-createCloudClient': require('./docs/API-createCloudClient').default,
  'API-CloudBlock': require('./docs/API-CloudBlock').default,
  'API-CloudDoc': require('./docs/API-CloudDoc').default,
  'API-CloudValue': require('./docs/API-CloudValue').default,
  'API-createSMSAuthProvider': require('./docs/API-createSMSAuthProvider')
    .default,
  'API-createEmailAuthProvider': require('./docs/API-createEmailAuthProvider')
    .default,
  'API-createAuthDataSource': require('./docs/API-createAuthDataSource')
    .default,
  'API-createMemoryDataSource': require('./docs/API-createMemoryDataSource')
    .default,
  'API-startFSDataSource': require('./docs/API-startFSDataSource').default,
  'API-startPostgresDataSource': require('./docs/API-startPostgresDataSource')
    .default,
  'API-createBrowserNetworkSource': require('./docs/API-createBrowserNetworkSource')
    .default,
  'API-createNodeNetworkSource': require('./docs/API-createNodeNetworkSource')
    .default,
  'API-createNativeNetworkSource': require('./docs/API-createNativeNetworkSource')
    .default,
  ObservableUsage: require('./docs/ObservableUsage').default,
  CloudReactHooks: require('./docs/CloudReactHooks').default,
  DataSources: require('./docs/DataSources').default,
  CloudClientIntro: require('./docs/CloudClientIntro').default,
  AuthIntro: require('./docs/AuthIntro').default,
  About: require('./docs/About').default,
  Roadmap: require('./docs/Roadmap').default,
  Contributors: require('./docs/Contributors').default,
  DocPermissions: require('./docs/DocPermissions').default,
  'Spec-ProtectedSource': require('./docs/Spec-ProtectedSource').default,
  'Spec-AuthProvider': require('./docs/Spec-AuthProvider').default,
  'Spec-Source': require('./docs/Spec-Source').default,
});

function SidebarSection({ title, children }) {
  return (
    <View
      style={{
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingBottom: 20,
      }}
    >
      <Text
        style={{
          color: '#111',
          fontSize: 30,
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
            backgroundColor: isActive ? '#fff' : undefined,
            paddingHorizontal: 20,
            paddingVertical: 8,
          }}
        >
          <Text
            style={{
              color: isActive ? '#007' : '#333',
              fontSize: 16,
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
        ...shadow,
        borderRightColor: shadowBorderColor,
        borderRightWidth: StyleSheet.hairlineWidth,
      }}
    >
      <View style={{}}>
        <SidebarSection title="Getting Started">
          <SidebarLink title="Quick Start" routeName="QuickStart" />
          <SidebarLink title="1. Data Sources" routeName="Tutorial1" />
          <SidebarLink title="2. Connect React" routeName="Tutorial2" />
          <SidebarLink title="3. Authentication" routeName="Tutorial3" />
        </SidebarSection>
        <SidebarSection title="Data & Network Sources">
          <SidebarLink title="Intro to Data Sources" routeName="DataSources" />
          <SidebarLink
            title="API: createMemoryDataSource"
            routeName="API-createMemoryDataSource"
          />
          <SidebarLink
            title="API: startFSDataSource"
            routeName="API-startFSDataSource"
          />
          <SidebarLink
            title="API: startPostgresDataSource"
            routeName="API-startPostgresDataSource"
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
          <SidebarLink title="SPEC: Data Source" routeName="Spec-DataSource" />
        </SidebarSection>
        <SidebarSection title="Cloud Client">
          <SidebarLink
            title="Introduce Cloud Client"
            routeName="CloudClientIntro"
          />
          <SidebarLink title="Using observables" routeName="ObservableUsage" />
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
            title="API: createAuthDataSource"
            routeName="API-createAuthDataSource"
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
            routeName="Spec-AuthDataSource"
          />
          <SidebarLink
            title="Spec: Auth Provider"
            routeName="Spec-AuthProvider"
          />
        </SidebarSection>
        <SidebarSection title="Advanced" />
        <SidebarSection title="Community">
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
