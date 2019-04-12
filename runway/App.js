import React, { useState, useReducer } from 'react';
import { View, Text, Animated, Button, TextInput } from 'react-native';
import useCloudState from '../cloud-core/useCloudState';
import useCloudReducer from '../cloud-core/useCloudReducer';
import kuid from 'kuid';

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
//         todosDoc.put([...(todos || []), { label: newTodoText, key: kuid() }]);
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
          todo: { label: newTodoText, key: kuid() },
        });
      }}
      onChangeText={setNewTodoText}
      value={newTodoText}
    />
  );
}

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 42 }}>My Todos:</Text>
      <TodoList />
      <AddTodo />
    </View>
  );
}
