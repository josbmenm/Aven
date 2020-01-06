import React from 'react';
import { View } from 'react-native';
import Text from '../dash-ui/Text';
import Button from '../dash-ui/Button';
import Stack from '../dash-ui/Stack';
import useCloudState from '../cloud-core/useCloudState';
import { createReducerStream } from '../cloud-core/Kite';
import {
  useCloud,
  useValue,
  useStream,
  useCloudValue,
} from '../cloud-core/KiteReact';
import Input from '../components/BlockFormInput';

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

// export default function DemoScreen() {
//   // const [string, setString] = React.useState();
//   const [string, setString] = useCloudState('SimpleString');
//   return (
//     <BaseScreen>
//       <Stack>
//         <Text>{string || 'please click:'}</Text>
//         <Stack horizontal>
//           <Button
//             title="set hello"
//             onPress={() => {
//               setString('HELLO');
//             }}
//           />
//           <Button
//             title="set world"
//             onPress={() => {
//               setString('WORLD');
//             }}
//           />
//         </Stack>
//       </Stack>
//     </BaseScreen>
//   );
// }

// export default function DemoScreen() {
//   const cloud = useCloud();
//   const testDoc = cloud.get('SimpleString');
//   const value = useValue(testDoc);
//   return (
//     <BaseScreen>
//       <Stack>
//         <Text>{value}</Text>
//       </Stack>
//     </BaseScreen>
//   );
// }

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
      <Input value={val} onValue={setVal} />
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
