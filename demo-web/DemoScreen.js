import React from 'react';
import { View } from 'react-native';
import Text from '../dash-ui/Text';
import { Button, Stack, TextInput } from '../dash-ui';
import { createReducerStream } from '../cloud-core/Kite';
import { useCloud, useStream } from '../cloud-core/KiteReact';

function BaseScreen({ children }) {
  return (
    <View
      style={{ flex: 1, backgroundColor: 'lightblue', alignItems: 'center' }}
    >
      <View
        style={{
          maxWidth: 400,
          backgroundColor: 'white',
          borderRadius: 4,
          marginVertical: 80,
        }}
      >
        {children}
      </View>
    </View>
  );
}

const todosReducer = (prevState = {}, action) => {
  const prevThings = prevState.things || [];
  switch (action.type) {
    case 'Add': {
      return {
        ...prevState,
        things: [...prevThings, action.thing],
      };
    }
    case 'Remove': {
      return {
        ...prevState,
        things: prevThings.filter(t => t !== action.thing),
      };
    }
  }
};

export default function DemoScreen() {
  // const [state, dispatch ] = React.useReducer()
  const actionsDoc = useCloud().get('TodoActions');
  const stateStream = React.useMemo(
    () =>
      createReducerStream(
        actionsDoc,
        todosReducer,
        { things: [] },
        'MyReducer',
      ),
    [actionsDoc],
  );
  const state = useStream(stateStream);

  return (
    <BaseScreen>
      <Stack>
        <Text>Todos</Text>
        {state && state.things && state.things.map(t => <Text>{t}</Text>)}
        <TodoInput
          onSubmit={thing => {
            // dispatch();
            actionsDoc.putTransactionValue({ type: 'Add', thing });
          }}
        />
      </Stack>
    </BaseScreen>
  );
}

function TodoInput({ onSubmit }) {
  const [val, setVal] = React.useState('');
  return (
    <Stack horizontal>
      <TextInput value={val} onValue={setVal} />
      <Button
        title="add"
        onPress={() => {
          onSubmit(val);
          setVal('');
        }}
        label="new task.."
      />
    </Stack>
  );
}
