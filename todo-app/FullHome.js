import React from 'react';
import { Text, View } from 'react-native';
import uuid from 'uuid/v4';

import useCloud from '../cloud-core/useCloud';
import useCloudValue from '../cloud-core/useCloudValue';

import Screen from './components/Screen';
import TextInput from './components/TextInput';
import TaskRow from './components/TaskRow';

function useTodoActions() {
  const cloud = useCloud();
  const actionsDoc = cloud.get('TodoActions');
  const actions = {};
  ['AddTask', 'SetTaskCompletion', 'RemoveTask'].forEach(actionName => {
    actions[actionName] = params =>
      actionsDoc.putTransaction({ type: actionName, params });
  });
  return actions;
}

function InputTodo() {
  const [draftTitle, setDraftTitle] = React.useState('');
  const { AddTask } = useTodoActions();
  return (
    <TextInput
      value={draftTitle}
      onChangeText={setDraftTitle}
      placeholder="Add new task.."
      onSubmitEditing={() => {
        AddTask({ title: draftTitle, id: uuid(), isComplete: false });
        setDraftTitle('');
      }}
    />
  );
}
function TaskReducer(state, action) {
  if (action.type === 'AddTask') {
    return [...state, action.params];
  } else if (action.type === 'SetTaskCompletion') {
    const taskIndex = state.findIndex(t => t.id === action.id);
    if (taskIndex === -1) {
      return state;
    }
    const newState = [...state];
    const oldTask = state[taskIndex];
    newState[taskIndex] = { ...oldTask, isComplete: action.isComplete };
    return newState;
  } else if (action.type === 'RemoveTask') {
    return state.filter(t => t.id !== action.id);
  }
  return state;
}
function TodoList() {
  const cloud = useCloud();
  cloud.setLambda('TodoReducer', (docState, doc, cloud, useValue) => {
    console.log('heyyooo', docState, doc.getFullName());
    let state = [];
    if (docState === undefined) {
      return state;
    }
    let action = docState;
    if (docState.on && docState.on.id) {
      const ancestorName =
        doc.getFullName() + '#' + docState.on.id + '^TodoReducer';
      console.log('using ' + ancestorName);
      state = useValue(cloud.get(ancestorName));
      action = docState.value;
    }
    console.log('heyyo22', state, action);
    return TaskReducer(state, action);
  });
  const todos = useCloudValue('TodoActions^TodoReducer');
  return todos.map(task => <TaskRow key={task.id} task={task} />);
  // return null;
  // console.log('rendering list with todos:', todos);
  // if (!todos || !todos.tasks) {
  //   return null;
  // }
  // return
}

function Title({ children }) {
  return (
    <Text style={{ margin: 30, fontSize: 72, color: '#789' }}>{children}</Text>
  );
}

export default function Home() {
  return (
    <Screen>
      <Title>Simple Todos</Title>
      <TodoList />
      <InputTodo />
    </Screen>
  );
}
