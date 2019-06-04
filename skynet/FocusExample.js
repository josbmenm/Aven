import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import xs from 'xstream';

const FocusContext = React.createContext();

function useFocusContext() {
  return React.useContext(FocusContext);
}
function FocusContextProvider({ children, id }) {
  const focusContextCache = React.useRef({}).current;
  const parentContext = useFocusContext();
  let focusStream = null;
  if (parentContext) {
    focusStream = parentContext.createFocusStream(id);
  } else {
    // top level focus stream provider:
    focusStream = focusContextCache.topFocusStream;
    if (!focusStream) {
      focusStream = focusContextCache.topFocusStream = xs.createWithMemory();
      focusStream.shamefullySendNext({ routes: [], index: 0, isFocused: true });
    }
  }
  function requestFocus(childId) {
    console.log('requestFocus', childId);
  }
  function createFocusStream(childId) {
    return focusStream.map(state => {
      console.log('mapping state yo', state, childId, id);
      return { isFocused: false };
    });
  }
  // React.useEffect(() => {}, [])
  function registerFocusable({ childId }) {
    console.log('registerFocusable', childId);
  }
  const focusContext = {
    createFocusStream,
    requestFocus,
    registerFocusable,
  };
  return (
    <FocusContext.Provider value={focusContext}>
      {children}
    </FocusContext.Provider>
  );
}

function useStream(stream) {
  const listenerRef = React.useRef();
  const lastStream = React.useRef(null);
  let [value, setValue] = React.useState();
  React.useEffect(() => {
    if (listenerRef.current && lastStream.current) {
      lastStream.current.removeListener(listenerRef.current);
    }
    lastStream.current = stream;
    listenerRef.current = {
      next: v => {
        setValue(v);
      },
    };
    stream.addListener(listenerRef.current);
    return () => {
      stream.removeListener(listenerRef.current);
    };
  }, [stream]);
  return value;
}

function useFocusable(id) {
  const focusContext = useFocusContext();
  const focusStream = React.useMemo(() => focusContext.createFocusStream(id), [
    id,
    focusContext,
  ]);
  const focusState = useStream(focusStream);
  React.useEffect(() => {
    focusContext.registerFocusable({ childId: id });
  }, [focusContext]);
  if (!focusState) {
    return false;
  }
  const { isFocused } = focusState;
  return { isFocused };
}

function DashPane({ children, id }) {
  const { isFocused } = useFocusable(id);
  return (
    <FocusContextProvider id={id}>
      <View
        style={{
          alignSelf: 'stretch',
          flex: 1,
          maxWidth: 400,
          borderColor: isFocused ? 'blue' : 'white',
          borderWidth: 1,
        }}
      >
        {children}
      </View>
    </FocusContextProvider>
  );
}

function DashWindow({ children, id }) {
  return (
    <FocusContextProvider id={id}>
      <View style={{ flex: 1, borderWidth: 2, flexDirection: 'row' }}>
        {children}
      </View>
    </FocusContextProvider>
  );
}
function DashSelectableRow({ id, title }) {
  const { isFocused } = useFocusable(id);
  return (
    <TouchableOpacity
      onPress={() => {}}
      style={{
        alignSelf: 'stretch',
        padding: 15,
        borderWidth: 4,
        borderColor: isFocused ? 'blue' : 'white',
      }}
    >
      <Text>{title}</Text>
    </TouchableOpacity>
  );
}

// end dash

export default function FocusExample() {
  return (
    <DashWindow>
      <DashPane id="pane1">
        <DashSelectableRow id={'h'} title={'Hello'} />
        <DashSelectableRow id={'a'} title={'Aaahh'} />
      </DashPane>
      <DashPane id="pane2">
        <DashSelectableRow id={'h'} title={'Hello'} />
        <DashSelectableRow id={'a'} title={'Aaahh'} />
      </DashPane>
    </DashWindow>
  );
}
FocusExample.navigationOptions = { title: 'Focus Test' };
