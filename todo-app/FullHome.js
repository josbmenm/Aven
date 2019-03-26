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

function TodoList() {
  const todos = useCloudValue('TodoActions');
  return <Title>{JSON.stringify(todos)}</Title>;
  console.log('rendering list with todos:', todos);
  if (!todos || !todos.tasks) {
    return null;
  }
  return todos.tasks.map(task => <TaskRow key={task.id} task={task} />);
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
