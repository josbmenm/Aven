import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  AlertIOS,
} from 'react-native';
import React, {
  useReducer,
  useContext,
  useState,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import createAppContainer from '../navigation-native/createAppContainer';
import createStackNavigator from '../navigation-stack/navigators/createStackNavigator';
import NetworkCloudProvider from '../cloud-native/NetworkCloudProvider';
import useCloud from '../aven-cloud/useCloud';
import useCloudValue from '../aven-cloud/useCloudValue';
import useObservable from '../aven-cloud/useObservable';
import useCloudReducer from '../aven-cloud/useCloudReducer';
import Animated, { Easing } from 'react-native-reanimated';
import { useNavigation } from '../navigation-hooks/Hooks';
import useFocus from '../navigation-hooks/useFocus';
import LabelInput from '../views/LabelInput';
import useAsyncStorage, { isStateUnloaded } from '../utils/useAsyncStorage';
import uuid from 'uuid/v1';

function ConnectedMessage() {
  const cloud = useCloud();
  const isConnected = useObservable(cloud.isConnected);
  return <Text>{isConnected ? 'Connected' : 'Not Connected'}</Text>;
}

function Thing() {
  const cloud = useCloud();
  const foo = useCloudValue(cloud.get('foo'));
  return <Text>{JSON.stringify(foo)}</Text>;
}

const todoReducer = `
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

function TodoItem({ item }) {
  return <Text>{item.label}</Text>;
}

function AddTodo() {
  const cloud = useCloud();
  const todosDoc = cloud.get('Todos');
  const todos = useCloudValue(todosDoc);
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
        todosDoc
          .put([...(todos || []), { label: newTodoText, key: uuid() }])
          .then(() => {
            console.log(todosDoc.getValue());
          })
          .catch(console.error);
        setNewTodoText('');
      }}
      onChangeText={setNewTodoText}
      value={newTodoText}
    />
  );
}

function TodoList() {
  const cloud = useCloud();
  const todosDoc = cloud.get('Todos');
  const todos = useCloudValue(todosDoc);
  if (!todos || todos.length === 0) {
    return <Text>Nothing to do!</Text>;
  }
  return todos.map(item => <TodoItem item={item} key={item.key} />);
}

function ResetButton() {
  const cloud = useCloud();
  const todosDoc = cloud.get('Todos');
  return <Text onPress={() => todosDoc.put([])}>Reset All Todos</Text>;
}

function Todos() {
  return (
    <View>
      <TodoList />
      <AddTodo />
      <ResetButton />
    </View>
  );
}

// function TodoList() {
//   const [state, dispatch] = useCloudReducer('Todos', todoReducer, []);
//   if (!state) {
//     return null;
//   }

//   return (
//     <View>
//       {state.map(item => {
//         return (
//           <View key={item.key}>
//             <Text>{item.title}</Text>
//           </View>
//         );
//       })}
//       <Button
//         onPress={() => {
//           dispatch({ type: 'AddTodo', todo: { title: 'asdf', key: 'foo' } });
//         }}
//         title="new todo"
//       />
//     </View>
//   );
// }

function Button({ title, onPress }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={{ padding: 20 }}>
        <Text style={{}}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

function LoginButtons() {
  const { navigate } = useNavigation();
  return (
    <React.Fragment>
      <Button
        title="Log In SMS"
        onPress={() => {
          navigate('Login', { provider: 'sms' });
        }}
      />
      <Button
        title="Log In Email"
        onPress={() => {
          navigate('Login', { provider: 'email' });
        }}
      />
    </React.Fragment>
  );
}

function DebugDoc({ doc }) {
  const v = useCloudValue(doc);
  return <Text>{JSON.stringify(v)}</Text>;
}

function AccountSection({ userDoc }) {
  const { DestroySession, setAccountName } = useCloud();
  const user = useCloudValue(userDoc);
  if (!userDoc) {
    return null;
  }
  return (
    <React.Fragment>
      <PageTitle title={`Logged in as ${userDoc.getFullName()}`} />
      <Button
        title="Logout"
        onPress={() => {
          DestroySession();
        }}
      />

      <Todos />
    </React.Fragment>
  );
}

const Home = () => {
  const { observeUserDoc } = useCloud();
  const userDoc = useObservable(observeUserDoc);
  console.log('asdfggzzz' + userDoc);
  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <ConnectedMessage />
      {userDoc && <AccountSection userDoc={userDoc} />}
      {!userDoc && <LoginButtons />}
    </View>
  );
};

const StyleContext = React.createContext({
  borderRadius: 4,
  textColor: '#222',
  primaryFontSize: 26,
  borderColor: '#555',
  commonPadding: 15,
  primaryColor: '#448',
  textColorAgainstPrimary: 'white',
});

function FormInput({ onValue, value, type }) {
  let keyboardType = 'default';
  if (type === 'phone') {
    keyboardType = 'phone-pad';
  }
  const {
    textColor,
    primaryFontSize,
    borderColor,
    borderRadius,
    commonPadding,
  } = useContext(StyleContext);
  return (
    <View style={{ borderWidth: 1, borderColor, borderRadius }}>
      <TextInput
        style={{
          padding: commonPadding,
          color: textColor,
          fontSize: primaryFontSize,
        }}
        value={value}
        onChangeText={onValue}
        keyboardType={keyboardType}
      />
    </View>
  );
}

function FormButton({ onPress, title }) {
  const {
    primaryFontSize,
    borderRadius,
    commonPadding,
    primaryColor,
    textColorAgainstPrimary,
  } = useContext(StyleContext);
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        padding: commonPadding,
        backgroundColor: primaryColor,
        borderRadius,
      }}
    >
      <Text
        style={{ fontSize: primaryFontSize, color: textColorAgainstPrimary }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function PageForm({ inputs, onSubmit }) {
  const [formState, dispatch] = useReducer(
    (state, action) => {
      if (action.type === 'InputValue') {
        return {
          ...state,
          inputState: { ...state.inputState, [action.name]: action.value },
        };
      }
      return state;
    },
    {
      inputState: {},
    }
  );
  const focus = useFocus({
    onSubmit: () => onSubmit(formState.inputState),
    inputRenderers: inputs.map(input => props => (
      <LabelInput
        label={input.label || input.name}
        key={input.name}
        value={formState.inputState[input.name]}
        onValue={value => {
          dispatch({
            type: 'InputValue',
            name: input.name,
            value,
          });
        }}
        type={input.type}
        {...props}
      />
    )),
  });
  return (
    <View style={{ marginHorizontal: 20 }}>
      {focus.inputs}
      <FormButton
        title="Submit"
        onPress={() => {
          onSubmit(formState.inputState);
        }}
      />
    </View>
  );
}

function Slider({ children, childKey }) {
  const [settledChildKey, setSettledChildKey] = useState(childKey);
  const lastChildren = useRef({
    [childKey]: children,
  });
  const [progress] = useState(new Animated.Value(0));
  useEffect(
    () => {
      if (childKey !== settledChildKey) {
        Animated.timing(progress, {
          toValue: 1,
          duration: 500,
          easing: Easing.bezier(0.2833, 0.99, 0.31833, 0.99),
        }).start(() => {
          lastChildren.current[settledChildKey] = null;
          setSettledChildKey(childKey);
        });
      } else {
        progress.setValue(0);
      }
      lastChildren.current[childKey] = children;
    },
    [children, childKey, settledChildKey]
  );

  let prevChildren = null;
  if (settledChildKey !== childKey && lastChildren.current[settledChildKey]) {
    prevChildren = lastChildren.current[settledChildKey];
  }

  const childrenTranslateX = Animated.interpolate(progress, {
    inputRange: [0, 1],
    outputRange: [80, 0],
  });
  const prevChildrenTranslateX = Animated.interpolate(progress, {
    inputRange: [0, 1],
    outputRange: [0, Animated.multiply(-1, 80)],
  });
  return (
    <Animated.View style={{ flex: 1 }}>
      {prevChildren && (
        <Animated.View
          style={{
            ...StyleSheet.absoluteFillObject,
            opacity: Animated.interpolate(progress, {
              inputRange: [0, 1],
              outputRange: [1, 0],
            }),
            transform: [{ translateX: prevChildrenTranslateX }],
          }}
        >
          {prevChildren}
        </Animated.View>
      )}
      <Animated.View
        style={{
          ...StyleSheet.absoluteFillObject,
          opacity: prevChildren ? progress : 1,
          transform: prevChildren ? [{ translateX: childrenTranslateX }] : [],
        }}
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
}

function SliderTest() {
  const [isA, setIsA] = useState(true);

  return (
    <Slider childKey={isA}>
      <View
        style={{ flex: 1, padding: 50, backgroundColor: isA ? 'red' : 'blue' }}
      >
        <Text
          style={{ color: 'white' }}
          onPress={() => {
            setIsA(!isA);
          }}
        >
          Do ze toggle
        </Text>
      </View>
    </Slider>
  );
}

function PageTitle({ title }) {
  return (
    <View style={{ paddingHorizontal: 20 }}>
      <Text style={{ fontSize: 42 }}>{title}</Text>
    </View>
  );
}

function getProviderName(provider) {
  switch (provider) {
    case 'sms':
      return 'phone number';
    case 'email':
    default:
      return 'email address';
  }
}

function getLoginInputs(provider) {
  switch (provider) {
    case 'sms':
      return [{ name: 'number', type: 'phone' }];
    case 'email':
    default:
      return [{ name: 'email', type: 'email' }];
  }
}

function getVerificationInfo(provider, values) {
  switch (provider) {
    case 'sms':
      return { number: values.number };
    case 'email':
    default:
      return { email: values.email };
  }
}

function ErrorView({ error }) {
  return (
    <View
      style={{
        padding: 20,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: 'red',
        marginHorizontal: 20,
        paddingVertical: 10,
      }}
    >
      <Text style={{ color: 'red' }}>{error && error.message}</Text>
    </View>
  );
}

function LoginForm({ onAuthCodeRequired, provider }) {
  const [formError, setFormError] = useState(null);
  const cloud = useCloud();
  const providerName = getProviderName(provider);
  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <PageTitle title={`Log in with ${providerName}`} />
      {formError && <ErrorView error={formError} />}
      <PageForm
        inputs={getLoginInputs(provider)}
        onSubmit={values => {
          // debugger;
          // provider;
          // onAuthCodeRequired();
          const loginQuery = {
            accountId: null,
            verificationResponse: null,
            verificationInfo: getVerificationInfo(provider, values),
          };
          cloud
            .CreateSession(loginQuery)
            .then(() => {
              onAuthCodeRequired(loginQuery);
            })
            .catch(e => setFormError(e));
        }}
      />
    </View>
  );
}

function AuthCodeForm({ authCodeQuery }) {
  const [formError, setFormError] = useState(null);
  const cloud = useCloud();
  const { goBack } = useNavigation();
  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <PageTitle title={`Enter verification code`} />
      {formError && <ErrorView error={formError} />}
      <PageForm
        inputs={[{ name: 'authcode', type: 'code', label: 'Code' }]}
        onSubmit={values => {
          cloud
            .CreateSession({
              ...authCodeQuery,
              verificationResponse: { key: values.authcode },
            })
            .then(() => {
              goBack();
            })
            .catch(e => setFormError(e));

          console.log(values);
        }}
      />
    </View>
  );
}

function Login() {
  const provider = useNavigation().getParam('provider');
  const [authCodeQuery, onAuthCodeQuery] = useState(null);
  if (authCodeQuery) {
    return (
      <Slider childKey="authCode">
        <AuthCodeForm authCodeQuery={authCodeQuery} />
      </Slider>
    );
  } else {
    return (
      <Slider childKey="login">
        <LoginForm
          onAuthCodeRequired={authQuery => onAuthCodeQuery(authQuery)}
          provider={provider}
        />
      </Slider>
    );
  }
}

const AppNavigator = createStackNavigator(
  { Home, Login },
  { headerMode: 'none' }
);

const AppNav = createAppContainer(AppNavigator);

function App() {
  const [session, setSession] = useAsyncStorage('CloudSession', null);
  console.log('session state', session);
  if (isStateUnloaded(session)) {
    return null;
  }
  return (
    <NetworkCloudProvider
      authority="localhost:3000"
      useSSL={false}
      domain="todo.aven.cloud"
      session={session}
      onSession={setSession}
    >
      <AppNav />
    </NetworkCloudProvider>
  );
}

export default App;
