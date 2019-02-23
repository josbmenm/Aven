import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
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
import NetworkCloudProvider from '../aven-cloud-native/NetworkCloudProvider';
import useCloud from '../aven-cloud/useCloud';
import useCloudValue from '../aven-cloud/useCloudValue';
import useObservable from '../aven-cloud/useObservable';
import useCloudReducer from '../aven-cloud/useCloudReducer';
import Animated, { Easing } from 'react-native-reanimated';

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

function TodoList() {
  const [state, dispatch] = useCloudReducer('Todos', todoReducer, []);
  if (!state) {
    return null;
  }

  return (
    <View>
      {state.map(item => {
        return (
          <View key={item.key}>
            <Text>{item.title}</Text>
          </View>
        );
      })}
      <Button
        onPress={() => {
          dispatch({ type: 'AddTodo', todo: { title: 'asdf', key: 'foo' } });
        }}
        title="new todo"
      />
    </View>
  );
}

function Button({ title, onPress }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={{ padding: 20 }}>
        <Text style={{}}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

const Home = ({ navigation }) => {
  // <TodoList />

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <ConnectedMessage />
      <Button
        title="Log In SMS"
        onPress={() => {
          navigation.navigate('Login', { provider: 'sms' });
        }}
      />
      <Button
        title="Log In Email"
        onPress={() => {
          navigation.navigate('Login', { provider: 'email' });
        }}
      />
      <Button title="Register" />
    </View>
  );
};

const StyleContext = React.createContext({
  borderRadius: 4,
  textColor: '#222',
  primaryFontSize: 14,
  borderColor: '#555',
  commonPadding: 15,
  primaryColor: 'blue',
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

function FormTitle({ children }) {
  return (
    <View>
      <Text style={{ color: 'red', fontSize: 42 }}>{children}</Text>
    </View>
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
  return (
    <View>
      <FormTitle title="Log In" />
      {inputs.map(input => {
        return (
          <FormInput
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
          />
        );
      })}
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

function LoginForm({ onAuthCodeRequired }) {
  const cloud = useCloud();
  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <PageForm
        inputs={[{ name: 'phone', type: 'phone' }]}
        onSubmit={values => {
          onAuthCodeRequired();

          // cloud
          //   .CreateSession({
          //     accountId: 'umm',
          //     verificationResponse: null,
          //     verificationInfo: { number: values.phone },
          //   })
          //   .then(() => {
          //     onAuthCodeRequired();
          //   })
          //   .catch(console.error);
        }}
      />
    </View>
  );
}

function AuthCodeForm() {
  const cloud = useCloud();
  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <PageForm
        inputs={[{ name: 'authcode', type: 'code' }]}
        onSubmit={values => {
          console.log(values);
        }}
      />
    </View>
  );
}

function Login() {
  const [isWaitingForAuthCode, setWaitingForAuthCode] = useState(false);
  if (isWaitingForAuthCode) {
    return (
      <Slider childKey="authCode">
        <AuthCodeForm />
      </Slider>
    );
  } else {
    return (
      <Slider childKey="login">
        <LoginForm onAuthCodeRequired={() => setWaitingForAuthCode(true)} />
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
  return (
    <NetworkCloudProvider
      authority="localhost:3000"
      useSSL={false}
      domain="todo.aven.cloud"
    >
      <AppNav />
    </NetworkCloudProvider>
  );
}

export default App;
