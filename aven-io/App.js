import { View, Text, Image, TextInput, Button } from 'react-native';
import React, { useState } from 'react';

import SwitchRouter from '../navigation-core/routers/SwitchRouter';
import SceneView from '../navigation-core/views/SceneView';
import getActiveChildNavigationOptions from '../navigation-core/utils/getActiveChildNavigationOptions';
import createNavigator from '../navigation-core/navigators/createNavigator';
import useCloud from '../aven-cloud/useCloud';
import useCloudValue from '../aven-cloud/useCloudValue';
import useCloudReducer from '../aven-cloud/useCloudReducer';
import Link from '../navigation-web/Link';
import uuid from 'uuid/v1';

process.env.REACT_NAV_LOGGING = true;

function Header({ descriptors }) {
  return (
    <View style={{ borderBottomWidth: 1, height: 90, flexDirection: 'row' }}>
      <Image
        source={require('./assets/AvenLogo.svg')}
        style={{ alignSelf: 'stretch', width: 200, margin: 20 }}
      />
      {Object.keys(descriptors).map(descriptorId => {
        return (
          <Link key={descriptorId} routeName={descriptorId}>
            {descriptorId}
          </Link>
        );
      })}
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
  const [_, dispatch] = useTodosTransactional();
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
      <Text style={{ fontSize: 42 }}>My Todos:</Text>
      <TodoList />
      <AddTodo />
    </View>
  );
}

const DocsRouter = SwitchRouter({
  DocsOverview: require('./docs/Aven-Overview').default,
  AuthMethods: require('./docs/Auth-Methods').default,
  Brainstorm: require('./docs/Auth-Methods').default,
});

function Sidebar({ descriptors, aboveList }) {
  return (
    <View style={{ borderRightWidth: 1, flex: 1, maxWidth: 360 }}>
      {aboveList}
      {Object.keys(descriptors).map(descriptorId => {
        return (
          <Link key={descriptorId} routeName={descriptorId}>
            {descriptorId}
          </Link>
        );
      })}
    </View>
  );
}

function SidebarView({ navigation, descriptors }) {
  const { state } = navigation;
  const route = state.routes[state.index];
  const descriptor = descriptors[route.key];
  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <Sidebar
        descriptors={descriptors}
        navigation={navigation}
        aboveList={
          <select
            value={navigation.getParam('version')}
            onChange={e =>
              navigation.setParams({ version: e.nativeEvent.target.value })
            }
          >
            <option value="1">1</option>
            <option value="2">2</option>
          </select>
        }
      />
      <SceneView
        component={descriptor.getComponent()}
        navigation={descriptor.navigation}
      />
    </View>
  );
}

const Docs = createNavigator(SidebarView, DocsRouter, {});

function About() {
  return (
    <View style={{ flex: 1 }}>
      <Text>Abouuut</Text>
    </View>
  );
}

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
    path: 'docs/:version',
    params: { version: '1' },
    inheritParams: ['version'],
    navigationOptions: ({ navigation, screenProps }) => ({
      title:
        getActiveChildNavigationOptions(navigation, screenProps).title +
        ' - Aven Docs',
    }),
  },
  About: {
    screen: About,
    path: 'about',
    navigationOptions: {
      title: 'About Aven',
    },
  },
});

const AppNavigator = createNavigator(AppView, AppRouter, {});

export default AppNavigator;
