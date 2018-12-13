import {
  createNavigator,
  NavigationContext,
  SwitchRouter,
} from '../navigation-core';
import React, { useEffect, useMemo, useState } from 'react';
import {
  AsyncStorage,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useNavigationState } from '../navigation-hooks/Hooks';

import createBrowserNetworkSource from '../aven-cloud-browser/createBrowserNetworkSource';
import CloudContext from '../aven-cloud/CloudContext';
import createCloudClient from '../aven-cloud/createCloudClient';
import useCloud from '../aven-cloud/useCloud';
import useCloudSession from '../aven-cloud/useCloudSession';
import useObservable from '../aven-cloud/useObservable';
import useRefValue from '../aven-cloud/useRefValue';
import JSONView from '../debug-views/JSONView';
const pathJoin = require('path').join;

function useActiveRoute() {
  const state = useNavigationState();

  return state.routes[state.index];
}

const UNLOADED_STATE = {};

function isStateUnloaded(s) {
  return s === UNLOADED_STATE;
}

function useAsyncStorage(storageKey, defaultValue) {
  const unloadedValue = UNLOADED_STATE;
  const [storageState, setInternalStorageState] = useState(unloadedValue);

  useEffect(
    () => {
      AsyncStorage.getItem(storageKey)
        .then(stored => {
          if (stored === null) {
            setInternalStorageState(defaultValue);
          } else {
            setInternalStorageState(JSON.parse(stored));
          }
        })
        .catch(console.error);
    },
    [storageKey],
  );

  function setStorageState(newState) {
    if (isStateUnloaded(storageState)) {
      throw new Error(
        'Cannot merge storage state if it has not been loaded yet!',
      );
    }
    setInternalStorageState(newState);
    AsyncStorage.setItem(storageKey, JSON.stringify(newState)).catch(
      console.error,
    );
  }

  return [storageState, setStorageState];
}

function Hero({ title }) {
  return (
    <Text
      style={{
        fontSize: 20,
        textAlign: 'center',
        fontWeight: '300',
        marginVertical: 30,
        color: '#343',
        paddingHorizontal: 15,
      }}
    >
      {title}
    </Text>
  );
}
function Title({ title }) {
  return (
    <View
      style={{
        marginVertical: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 15,
      }}
    >
      {title.split('.').map((t, i, a) => (
        <Text
          key={i}
          style={{
            fontSize: 36,
            textAlign: 'center',
            fontWeight: '300',
            color: '#343',
          }}
        >
          {t}
          {i === a.length - 1 ? '' : '.'}
        </Text>
      ))}
    </View>
  );
}

const Styles = {
  inputHeight: 50,
  highlightColor: '#027C6F',
  labelColor: '#222',
  rowBorderColor: '#ccc',
};

function Button({ onPress, title, style, secondary }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          backgroundColor: secondary ? '#ccc' : Styles.highlightColor,
          height: Styles.inputHeight,
          borderRadius: Styles.inputHeight / 2,
          paddingHorizontal: 25,
          paddingVertical: 7,
          ...style,
        }}
      >
        <Text
          style={{
            color: secondary ? '#333' : 'white',
            textAlign: 'center',
            fontSize: 28,
          }}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function FormButton(props) {
  return <Button {...props} style={{ marginVertical: 5 }} />;
}

function StandaloneButton(props) {
  return <Button {...props} style={{ margin: 15 }} />;
}

function FieldLabel({ label, onPress }) {
  return (
    <Text
      onPress={onPress}
      style={{
        marginHorizontal: 20,
        color: Styles.labelColor,
        fontWeight: 'bold',
        fontSize: 14,
      }}
    >
      {label}
    </Text>
  );
}

function InputField({ name, value, onValue, onSubmit }) {
  return (
    <View style={{ paddingVertical: 8 }}>
      <FieldLabel label={name} />
      <TextInput
        value={value || ''}
        onChangeText={onValue}
        onSubmitEditing={onSubmit}
        style={{
          backgroundColor: 'white',
          height: Styles.inputHeight,
          borderRadius: Styles.inputHeight / 2,
          paddingHorizontal: 20,
          paddingVertical: 5,
          marginTop: 4,
        }}
      />
    </View>
  );
}

function BooleanField({ name, value, onValue }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 15,
      }}
    >
      <FieldLabel
        label={name}
        onPress={() => {
          onValue(!value);
        }}
      />
      <Switch value={value} style={{}} onValueChange={onValue} />
    </View>
  );
}

function Form({ children }) {
  return (
    <View
      style={{
        paddingVertical: 15,
        paddingHorizontal: 15,
        flex: 1,
        backgroundColor: '#0001',
      }}
    >
      {children}
    </View>
  );
}

function ConnectionForm({ onClientConfig, defaultSession }) {
  const [authority, setAuthority] = useState(defaultSession.authority);
  const [domain, setDomain] = useState(defaultSession.domain);
  const [useSSL, setUseSSL] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { navigate } = useNavigation();
  if (isConnecting) {
    return <Text>One moment..</Text>;
  }
  function connect() {
    setIsConnecting(true);
    onClientConfig({
      authority,
      useSSL,
      domain,
    });
  }
  return (
    <Form>
      <InputField
        value={authority}
        onValue={setAuthority}
        name="Authority"
        onSubmit={connect}
      />
      <InputField
        value={domain}
        onValue={setDomain}
        name="Domain"
        onSubmit={connect}
      />
      <BooleanField value={useSSL} onValue={setUseSSL} name="Use HTTPS" />
      <FormButton title="Connect" onPress={connect} />
    </Form>
  );
}

function Pane({ children }) {
  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: '#f0f0f0',
        borderRightWidth: StyleSheet.hairlineWidth,
        borderRightColor: '#aaa',
        maxWidth: 450,
        minWidth: 300,
      }}
    >
      {children}
    </ScrollView>
  );
}

function LargePane({ children }) {
  return (
    <ScrollView
      style={{
        flex: 4,
        backgroundColor: '#f0f0f0',
        borderRightWidth: StyleSheet.hairlineWidth,
        borderRightColor: '#aaa',
      }}
    >
      {children}
    </ScrollView>
  );
}

function EmailLoginInfo({ onSubmit }) {
  const [email, setEmail] = useState('');
  return (
    <InputField
      name="Email Address"
      value={email}
      onValue={setEmail}
      onSubmit={onSubmit}
    />
  );
}

function SMSLoginInfo({ onSubmit }) {
  const [phone, setPhone] = useState('');
  return (
    <InputField
      name="Phone Number"
      value={phone}
      onValue={setPhone}
      onSubmit={onSubmit}
    />
  );
}

function RootLoginInfo({ loginInfo, setLoginInfo, onSubmit }) {
  return (
    <InputField
      name="Password"
      onSubmit={onSubmit}
      value={
        loginInfo &&
        loginInfo.verificationResponse &&
        loginInfo.verificationResponse.password
      }
      onValue={password =>
        setLoginInfo({
          accountId: 'root',
          verificationInfo: { type: 'root' },
          verificationResponse: { password },
        })
      }
    />
  );
}

function PasswordLoginInfo({ onSubmit }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  return (
    <React.Fragment>
      <InputField
        name="Username"
        value={username}
        onValue={setUsername}
        onSubmit={onSubmit}
      />
      <InputField
        name="Password"
        value={password}
        onValue={setPassword}
        onSubmit={onSubmit}
      />
    </React.Fragment>
  );
}

function LoginInfo({ mode, ...props }) {
  switch (mode) {
    case 'email':
      return <EmailLoginInfo {...props} />;
    case 'sms':
      return <SMSLoginInfo {...props} />;
    case 'password':
      return <PasswordLoginInfo {...props} />;
    case 'root':
    default:
      return <RootLoginInfo {...props} />;
  }
}

function LoginForm({ onSession, onClientConfig }) {
  const [isWorking, setIsWorking] = useState(false);
  const [loginInfo, setLoginInfo] = useState(null);
  const [mode, setMode] = useState('root');
  const { navigate } = useNavigation();
  if (isWorking) {
    return <Text>One moment..</Text>;
  }
  const cloud = useCloud();
  async function doLogin() {
    setIsWorking(true);
    const resp = await cloud.CreateSession({
      accountId: loginInfo.accountId,
      verificationResponse: loginInfo.verificationResponse,
      verificationInfo: loginInfo.verificationInfo,
    });
    if (resp.session) {
      onSession(resp.session);
      navigate('Home');
    }
  }
  return (
    <Form>
      <FormButton
        title="Edit Connection"
        onPress={() => {
          onClientConfig(null);
        }}
      />
      <select
        value={mode}
        onChange={e => {
          setMode(e.target.value);
          setLoginInfo(null);
        }}
      >
        <option value="root">Root Authentication</option>
        <option value="email">Email</option>
        <option value="sms">Phone Number</option>
        <option value="password">Password</option>
      </select>
      <LoginInfo
        mode={mode}
        loginInfo={loginInfo}
        setLoginInfo={setLoginInfo}
        onSubmit={doLogin}
      />
      {!!loginInfo && <FormButton title="Login" onPress={doLogin} />}
    </Form>
  );
}

function LoginPane({ onClientConfig, onSession, defaultSession }) {
  const cloud = useCloud();
  const session = useCloudSession();
  if (session) {
    return (
      <Pane>
        <Hero title="Logged in" />
      </Pane>
    );
  }
  if (cloud) {
    return (
      <Pane>
        <Hero title="Login" />
        <View>
          <LoginForm
            onSession={onSession}
            onClientConfig={onClientConfig}
            defaultSession={defaultSession}
          />
        </View>
      </Pane>
    );
  }
  return (
    <Pane>
      <Hero title="Connect" />
      <View>
        <ConnectionForm
          onClientConfig={onClientConfig}
          defaultSession={defaultSession}
        />
      </View>
    </Pane>
  );
}

function RowSection({ children }) {
  return (
    <View
      style={{
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Styles.rowBorderColor,
      }}
    >
      {children}
    </View>
  );
}

function Row({ children, isSelected }) {
  return (
    <View
      style={{
        padding: 15,
        backgroundColor: isSelected ? '#96F3E9' : 'white',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Styles.rowBorderColor,
      }}
    >
      {children}
    </View>
  );
}

function LinkRow({ title, onPress, isSelected }) {
  const [isHighlighted, setIsHighlighted] = useState(false);
  return (
    <TouchableOpacity
      onPress={onPress}
      onMouseEnter={() => {
        setIsHighlighted(true);
      }}
      onMouseLeave={() => {
        setIsHighlighted(false);
      }}
    >
      <Row isSelected={isSelected}>
        <Text
          style={{
            fontSize: 16,
            color: isHighlighted ? 'black' : '#333',
          }}
        >
          {title}
        </Text>
      </Row>
    </TouchableOpacity>
  );
}

function RefsList({ parent, activeRef }) {
  const cloud = useCloud();
  const { navigate } = useNavigation();
  const refsListName = parent ? `${parent}/_refs` : '_refs';
  const refNames = useObservable(cloud.getRef(refsListName).observeValue);
  const refs = refNames && refNames.map(cloud.getRef);
  if (!refs) {
    return null;
  }
  return (
    <RowSection>
      {refs
        .filter(r => !r.getState().isDestroyed)
        .map(ref => {
          const refName = parent ? pathJoin(parent, ref.name) : ref.name;
          const matchingRef = activeRef && activeRef.match(refName);
          const isSelected = !!matchingRef && matchingRef.index === 0;
          return (
            <LinkRow
              key={ref.name}
              isSelected={isSelected}
              title={ref.name}
              onPress={() => {
                navigate('Ref', { refName, refPath: null });
              }}
            />
          );
        })}
    </RowSection>
  );
}

function AddRefSection() {
  const cloud = useCloud();
  let [isOpened, setIsOpened] = useState(false);
  let [newRefName, setNewRefName] = useState('');
  function submit() {
    cloud.getRef(newRefName).put(null);
    setIsOpened(false);
    setNewRefName('');
  }
  if (isOpened) {
    return (
      <Form>
        <InputField
          value={newRefName}
          onValue={setNewRefName}
          name="New Ref Name"
          onSubmit={submit}
        />
        <FormButton title="Create Ref" onPress={submit} />
        <FormButton
          title="Cancel"
          secondary
          onPress={() => {
            setIsOpened(false);
            setNewRefName('');
          }}
        />
      </Form>
    );
  }
  return (
    <StandaloneButton
      title="Create Ref"
      onPress={() => {
        setIsOpened(true);
      }}
    />
  );
}

function RefsPane({ onClientConfig, onSession }) {
  const { domain } = useCloud();
  const { navigate, state } = useNavigation();
  const refRoute =
    state.routes && state.routes.find(r => r.routeName === 'Ref');
  const activeRef = refRoute && refRoute.params.refName;
  return (
    <Pane>
      <Title title={domain} />
      <RefsList parent={null} activeRef={activeRef} />
      <AddRefSection />
      <StandaloneButton
        title="Log out"
        onPress={() => {
          onClientConfig(null);
          onSession(null);
          navigate('Login');
        }}
      />
    </Pane>
  );
}

function Folder({ value, path, cloudRef, pathContext }) {
  let pathViews = null;
  const navigation = useNavigation();

  const pathSegments = path && path.split('/');
  const nextPathSegment = pathSegments && pathSegments[0];
  const restOfPath = pathSegments && pathSegments.slice(1).join('/');

  const file = value.files[nextPathSegment];
  const obj = useMemo(
    () => {
      if (!file || !file.id) {
        return null;
      }
      return cloudRef.getObject(file.id);
    },
    [file],
  );
  const objValue = useObservable(obj && obj.observeValue);

  if (objValue) {
    pathViews = (
      <ValuePane
        value={objValue}
        path={restOfPath}
        cloudRef={cloudRef}
        pathContext={[...pathContext, nextPathSegment]}
      />
    );
  }

  return (
    <React.Fragment>
      <Pane>
        <RowSection>
          {Object.keys(value.files).map(fileName => (
            <LinkRow
              key={fileName}
              isSelected={nextPathSegment === fileName}
              title={fileName}
              onPress={() => {
                const nextPath = [...pathContext, fileName].join('/');
                navigation.setParams({
                  refPath: nextPath,
                });
              }}
            />
          ))}
        </RowSection>
      </Pane>

      {pathViews}
    </React.Fragment>
  );
}

process.env.REACT_NAV_LOGGING = true;

function useParam(paramName) {
  const { getParam, dangerouslyGetParent } = useNavigation();
  let parent = dangerouslyGetParent();
  let val = getParam(paramName);
  // while (val === undefined && parent && parent.getParam) {
  //   val = parent.getParam(paramName);
  //   parent = parent.dangerouslyGetParent();
  // }
  return val;
}

function StringPane({ value, onValue }) {
  return (
    <Pane>
      <Text>{value}</Text>
    </Pane>
  );
}

function BooleanPane({ value, onValue }) {
  return (
    <Pane>
      <Text>{value ? 'True' : 'False'}</Text>
    </Pane>
  );
}

function NumberPane({ value, onValue }) {
  return (
    <Pane>
      <Text>{value}</Text>
    </Pane>
  );
}

function AddKeySection({ onNewKey }) {
  let [isOpened, setIsOpened] = useState(false);
  let [keyName, setKeyName] = useState('');
  function submit() {
    onNewKey(keyName);
    setIsOpened(false);
    setKeyName('');
  }
  if (isOpened) {
    return (
      <Form>
        <InputField
          value={keyName}
          onValue={setKeyName}
          name="New Key Name"
          onSubmit={submit}
        />
        <FormButton title="Add Key" onPress={submit} />
        <FormButton
          title="Cancel"
          secondary
          onPress={() => {
            setIsOpened(false);
            setKeyName('');
          }}
        />
      </Form>
    );
  }
  return (
    <StandaloneButton
      title="Add Key"
      onPress={() => {
        setIsOpened(true);
      }}
    />
  );
}

function ObjectPane({ path, value, onValue, pathContext, cloudRef }) {
  let pathViews = null;

  const navigation = useNavigation();

  const pathSegments = path && path.split('/');
  const nextPathSegment = pathSegments && pathSegments[0];
  const restOfPath = pathSegments && pathSegments.slice(1).join('/');
  const pathValue = nextPathSegment != null && value[nextPathSegment];

  if (pathValue) {
    pathViews = (
      <ValuePane
        value={pathValue}
        path={restOfPath}
        cloudRef={cloudRef}
        pathContext={[...pathContext, nextPathSegment]}
      />
    );
  }

  return (
    <React.Fragment>
      <Pane>
        <RowSection>
          {Object.keys(value).map(objKey => (
            <LinkRow
              key={objKey}
              isSelected={false}
              title={objKey}
              onPress={() => {
                const nextPath = [...pathContext, objKey].join('/');
                navigation.setParams({
                  refPath: nextPath,
                });
              }}
            />
          ))}
        </RowSection>
        <AddKeySection
          onNewKey={newKey => {
            onValue({ ...value, [newKey]: null });
          }}
        />
      </Pane>
      {pathViews}
    </React.Fragment>
  );
}

function ValuePane({ value, path, cloudRef, pathContext }) {
  let presentationValue = value === null ? {} : value;
  if (value === undefined) {
    return <Text>Loading</Text>;
  }
  if (typeof presentationValue === 'string') {
    return (
      <StringPane
        value={value}
        onValue={v => {
          cloudRef.put(v);
        }}
      />
    );
  }
  if (typeof presentationValue === 'boolean') {
    return (
      <BooleanPane
        value={value}
        onValue={v => {
          cloudRef.put(v);
        }}
      />
    );
  }
  if (typeof presentationValue === 'number') {
    return (
      <NumberPane
        value={value}
        onValue={v => {
          cloudRef.put(v);
        }}
      />
    );
  }
  if (presentationValue.type === 'Folder') {
    return (
      <Folder
        value={presentationValue}
        path={path}
        cloudRef={cloudRef}
        pathContext={pathContext}
      />
    );
  }

  if (typeof presentationValue === 'object') {
    return (
      <ObjectPane
        value={presentationValue}
        path={path}
        cloudRef={cloudRef}
        pathContext={pathContext}
        onValue={v => {
          cloudRef.put(v);
        }}
      />
    );
  }
  throw new Error('Bad type!');
}

function RefValuePane() {
  const name = useParam('refName');
  const path = useParam('refPath');
  const cloud = useCloud();

  const cloudRef = cloud.getRef(name);
  const value = useRefValue(cloudRef);

  return (
    <ValuePane cloudRef={cloudRef} value={value} path={path} pathContext={[]} />
  );
}

function InfoSection({ text }) {
  return (
    <Text style={{ paddingHorizontal: 15, paddingVertical: 5 }}>{text}</Text>
  );
}

function RefSetForm({ cloudRef }) {
  const r = useObservable(cloudRef.observe);

  let [isOpened, setIsOpened] = useState(false);
  let [nextId, setNextId] = useState(r ? r.id : '');
  if (!isOpened) {
    return (
      <StandaloneButton
        title="Set Object ID"
        onPress={() => {
          setIsOpened(true);
        }}
      />
    );
  }
  function submit() {
    setIsOpened(false);
    setNextId(null);
    cloudRef.putId(nextId).catch(e => {
      alert('Error');
      console.error(e);
    });
  }
  return (
    <Form>
      <InputField
        value={nextId}
        onValue={setNextId}
        name="New ID"
        onSubmit={submit}
      />
      <FormButton title="Set ID" onPress={submit} />
    </Form>
  );
}

function SlideableNavigation({ navigation, descriptors }) {
  const { routes, index } = navigation.state;
  const activeKey = routes[index].key;
  const activeDescriptor = descriptors[activeKey];
  const ScreenComponent = activeDescriptor.getComponent();
  return (
    <NavigationContext.Provider value={activeDescriptor.navigation}>
      <ScreenComponent navigation={activeDescriptor.navigation} />
    </NavigationContext.Provider>
  );
}

function pathApartName(name) {
  const parts = name.split('/');
  return parts.map((p, index) => {
    return parts.slice(0, index + 1).join('/');
  });
}

function RefMetaPanes() {
  const name = useParam('refName');
  const nameParts = pathApartName(name);
  return nameParts.map(name => <RefMetaPane name={name} />);
}

function RefMetaPane({ name }) {
  const { navigate, getParam } = useNavigation();
  const cloud = useCloud();
  const cloudRef = cloud.getRef(name);
  const r = useObservable(cloudRef.observe);
  const activeRef = getParam('refName');

  return (
    <Pane>
      <Title title={cloudRef.name} />
      {r && <InfoSection text={` ID: ${r.id}`} />}
      <StandaloneButton
        title="Destroy"
        onPress={() => {
          navigate('Refs');
          cloud.destroyRef(cloudRef).catch(console.error);
        }}
      />
      <RefSetForm cloudRef={cloudRef} />
      <RefsList parent={name} activeRef={activeRef} />
    </Pane>
  );
}

const RefPaneNavigator = createNavigator(
  SlideableNavigation,
  SwitchRouter({
    RefValue: {
      path: 'value',
      screen: RefValuePane,
      params: { refPath: '' },
      inheritParams: ['refName'],
    },
  }),
  {
    explicitParams: true,
  },
);

function RefPane({ navigation }) {
  return (
    <React.Fragment>
      <RefMetaPanes />
      <RefPaneNavigator navigation={navigation} />
    </React.Fragment>
  );
}
RefPane.router = RefPaneNavigator.router;

function EmptyScreen() {
  return null;
}

const MainPaneNavigator = createNavigator(
  SlideableNavigation,
  SwitchRouter({
    Refs: { path: '', screen: EmptyScreen },
    Ref: {
      path: 'ref',
      screen: RefPane,
      params: { refName: null },
    },
  }),
  {
    explicitParams: true,
  },
);

function MainPane({ onClientConfig, onSession, navigation }) {
  return (
    <React.Fragment>
      <RefsPane onClientConfig={onClientConfig} onSession={onSession} />
      <MainPaneNavigator navigation={navigation} />
    </React.Fragment>
  );
}
MainPane.router = MainPaneNavigator.router;

function BackgroundView({ children }) {
  return (
    <View style={{ flex: 1 }}>
      <Image
        style={{ flex: 1 }}
        resizeMode="repeat"
        source={require('./BgTexture.png')}
      />
      <View style={{ ...StyleSheet.absoluteFillObject, flexDirection: 'row' }}>
        {children}
      </View>
    </View>
  );
}

function AdminApp({ defaultSession = {}, descriptors }) {
  let [sessionState, setSessionState] = useAsyncStorage(
    'AvenSessionState',
    null,
  );

  let [clientConfig, setClientConfig] = useAsyncStorage(
    'AvenClientConfig',
    null,
  );

  let client = useMemo(
    () => {
      if (isStateUnloaded(clientConfig) || clientConfig === null) {
        return null;
      }
      const { authority, useSSL, domain } = clientConfig;

      const dataSource = createBrowserNetworkSource({
        authority,
        useSSL,
      });
      const client = createCloudClient({
        initialSession: sessionState,
        dataSource,
        domain,
      });

      return client;
    },
    [clientConfig],
  );

  const activeRoute = useActiveRoute();

  const { navigate } = useNavigation();

  useEffect(
    () => {
      if (
        !isStateUnloaded(clientConfig) &&
        !client &&
        activeRoute.routeName !== 'Login'
      ) {
        navigate('Login');
      }
      if (
        !isStateUnloaded(sessionState) &&
        !sessionState &&
        activeRoute.routeName !== 'Login'
      ) {
        navigate('Login');
      }
    },
    [activeRoute, sessionState, clientConfig, client],
  );

  const activeDescriptor = descriptors[activeRoute.key];

  const ScreenComponent = activeDescriptor.getComponent();

  if (!client && activeRoute.routeName !== 'Login') {
    return <Text>Wait..</Text>;
  }

  return (
    <BackgroundView>
      <CloudContext.Provider value={client}>
        <NavigationContext.Provider value={activeDescriptor.navigation}>
          <ScrollView horizontal>
            <ScreenComponent
              onClientConfig={setClientConfig}
              onSession={setSessionState}
              defaultSession={{
                authority: defaultSession.authority || 'localhost:3000',
                domain: defaultSession.domain || 'test.aven.cloud',
              }}
              navigation={activeDescriptor.navigation}
            />
          </ScrollView>
        </NavigationContext.Provider>
      </CloudContext.Provider>
    </BackgroundView>
  );

  // if (!client) {
  //   return (
  //     <BackgroundView>
  //       <LoginPane
  //         onClientConfig={setClientConfig}
  //         defaultSession={{
  //           authority: defaultSession.authority || "localhost:3000",
  //           domain: defaultSession.domain || "test.aven.cloud"
  //         }}
  //       />
  //       <PlaceholderMainPane title="" />
  //     </BackgroundView>
  //   );
  // }
  // return (
  //   <BackgroundView>
  //     <CloudContext.Provider value={client}>
  //       <RefsPane
  //         activeRef={activeRef}
  //         onLogout={() => {
  //           setClientConfig(null);
  //           setActiveRef(null);
  //         }}
  //         onActiveRef={setActiveRef}
  //       />
  //       <MainPane activeRef={activeRef} onActiveRef={setActiveRef} />
  //     </CloudContext.Provider>
  //   </BackgroundView>
  // );
}

const router = SwitchRouter(
  {
    Home: {
      path: '',
      screen: MainPane,
      navigationOptions: {
        title: 'Admin',
      },
    },
    Login: {
      path: 'login',
      screen: LoginPane,
      navigationOptions: {
        title: 'Login - Admin',
      },
    },
  },
  {
    explicitParams: true,
  },
);

export default createNavigator(AdminApp, router, {});
