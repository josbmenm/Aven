import React from 'react';
import { Text } from 'react-native';
import uuid from 'uuid/v4';

import useCloud from '../cloud-core/useCloud';
import useCloudReducer from '../cloud-core/useCloudReducer';

import Screen from './components/Screen';
import TextInput from './components/TextInput';
import TaskRow from './components/TaskRow';

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

function useTaskActions() {
  const cloud = useCloud();
  const actionsDoc = cloud.get('TaskActions');
  const dispatch = actionsDoc.putTransaction;
  return {
    addTask: params => dispatch({ type: 'AddTask', params }),
    removeTask: id => dispatch({ type: 'RemoveTask', id }),
    setTaskCompletion: (id, isComplete) =>
      dispatch({ type: 'SetTaskCompletion', id, isComplete }),
  };
}
function useTasks() {
  const [tasks] = useCloudReducer(
    'TaskActions',
    'TaskReducer',
    TaskReducer,
    [],
  );
  return {
    tasks,
    ...useTaskActions(),
  };
}
function InputTodo() {
  const [draftTitle, setDraftTitle] = React.useState('');
  const { addTask } = useTasks();
  return (
    <TextInput
      value={draftTitle}
      onChangeText={setDraftTitle}
      placeholder="Add new task.."
      onSubmitEditing={() => {
        addTask({ title: draftTitle, id: uuid(), isComplete: false });
        setDraftTitle('');
      }}
    />
  );
}

function TaskList() {
  const { tasks, removeTask } = useTasks();
  if (!tasks) {
    return null;
  }
  return tasks.map(task => (
    <TaskRow key={task.id} task={task} onRemove={() => removeTask(task.id)} />
  ));
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
      <TaskList />
      <InputTodo />
    </Screen>
  );
}
