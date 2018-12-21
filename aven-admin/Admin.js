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

function isPrimitive(v) {
  const t = typeof v;
  return v == null || t === 'boolean' || t === 'string' || t === 'number';
}

function Hero({ title }) {
  return (
    <Title
      title={title}
      style={{
        textAlign: 'center',
      }}
    />
  );
}
function Title({ title, style }) {
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
            ...style,
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
function OptionField({ options, value, onValue }) {
  return (
    <select
      value={value}
      onChange={e => {
        onValue(e.target.value);
      }}
    >
      {options.map(option => (
        <option value={option.value} key={option.value}>
          {option.label}
        </option>
      ))}
    </select>
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
        backgroundColor: '#fdfeff',
        marginHorizontal: 10,
        width: 300,
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

function EmailLoginInfo({
  loginInfo,
  onLoginInfo,
  onSubmit,
  verificationChallenge,
}) {
  if (verificationChallenge) {
    return (
      <React.Fragment>
        <Text>Enter code sent to {verificationChallenge.email}</Text>
        <InputField
          name="Verification Code"
          value={
            loginInfo &&
            loginInfo.verificationResponse &&
            loginInfo.verificationResponse.key
          }
          onValue={key => {
            onLoginInfo({
              ...loginInfo,
              verificationResponse: {
                key,
              },
            });
          }}
          onSubmit={onSubmit}
        />
      </React.Fragment>
    );
  }
  return (
    <InputField
      name="Email Address"
      value={
        loginInfo &&
        loginInfo.verificationInfo &&
        loginInfo.verificationInfo.email
      }
      onValue={email => {
        onLoginInfo({
          ...loginInfo,
          verificationInfo: {
            email,
          },
        });
      }}
      onSubmit={onSubmit}
    />
  );
}

function SMSLoginInfo({
  loginInfo,
  onLoginInfo,
  onSubmit,
  verificationChallenge,
}) {
  if (verificationChallenge) {
    return (
      <React.Fragment>
        <Text>Enter code sent to {verificationChallenge.phone}</Text>
        <InputField
          name="Verification Code"
          value={
            loginInfo &&
            loginInfo.verificationResponse &&
            loginInfo.verificationResponse.key
          }
          onValue={key => {
            onLoginInfo({
              ...loginInfo,
              verificationResponse: {
                key,
              },
            });
          }}
          onSubmit={onSubmit}
        />
      </React.Fragment>
    );
  }
  return (
    <InputField
      name="Phone Number"
      value={
        loginInfo &&
        loginInfo.verificationInfo &&
        loginInfo.verificationInfo.number
      }
      onValue={number => {
        onLoginInfo({
          verificationInfo: {
            number,
          },
        });
      }}
      onSubmit={onSubmit}
    />
  );
}

function RootLoginInfo({ loginInfo, onLoginInfo, onSubmit }) {
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
        onLoginInfo({
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

function AuthMethodInput({
  onSubmit,
  verificationChallenge,
  loginInfo,
  onLoginInfo,
}) {
  const [mode, setMode] = useState('root');
  console.log('ALRIGHT DUUDE!', mode);
  return (
    <React.Fragment>
      <OptionField
        options={[
          { value: 'root', label: 'Root Authentication' },
          { value: 'email', label: 'Email' },
          { value: 'sms', label: 'Phone Number' },
          { value: 'password', label: 'Password' },
        ]}
        value={mode}
        onValue={nextMode => {
          setMode(nextMode);
          onLoginInfo(null);
        }}
      />
      <LoginInfo
        mode={mode}
        loginInfo={loginInfo}
        onLoginInfo={onLoginInfo}
        verificationChallenge={verificationChallenge}
        onSubmit={onSubmit}
      />
    </React.Fragment>
  );
}

function LoginForm({ onSession, onClientConfig }) {
  const [isWorking, setIsWorking] = useState(false);
  const [loginInfo, setLoginInfo] = useState(null);
  const [verificationChallenge, setVerificationChallenge] = useState(null);
  const { navigate } = useNavigation();
  const cloud = useCloud();
  async function doLogin() {
    setIsWorking(true);
    const resp = await cloud.CreateSession({
      accountId: loginInfo.accountId,
      verificationResponse: loginInfo.verificationResponse,
      verificationInfo: loginInfo.verificationInfo,
    });
    setIsWorking(false);
    if (resp.verificationChallenge) {
      setVerificationChallenge(resp.verificationChallenge);
    }
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
      {isWorking && <Text>One moment..</Text>}
      <AuthMethodInput
        onLoginInfo={setLoginInfo}
        loginInfo={loginInfo}
        verificationChallenge={verificationChallenge}
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
        justifyContent: 'space-between',
      }}
    >
      {children}
    </View>
  );
}

function LinkRow({
  title,
  onPress,
  isSelected,
  tintColor = 'black',
  children,
}) {
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
            opacity: isHighlighted ? 1 : 0.8,
            color: tintColor,
          }}
        >
          {title}
        </Text>
        {children}
      </Row>
    </TouchableOpacity>
  );
}

function RefsList({ parent, activeRef }) {
  const cloud = useCloud();
  const { navigate } = useNavigation();
  const refsListName = parent ? `${parent}/_refs` : '_refs';
  const refNames = useObservable(cloud.get(refsListName).observeValue);
  const refs = refNames && refNames.map(cloud.get);
  if (!refs) {
    return null;
  }
  return (
    <RowSection>
      {refs
        .filter(r => !r.getState().isDestroyed)
        .map(ref => {
          const localName = ref.getName();
          const refName = parent ? pathJoin(parent, localName) : localName;
          const matchingRef = activeRef && activeRef.match(refName);
          const isSelected = !!matchingRef && matchingRef.index === 0;
          return (
            <LinkRow
              key={localName}
              isSelected={isSelected}
              title={localName}
              onPress={() => {
                navigate('Ref', { refName, refPath: null });
              }}
            />
          );
        })}
    </RowSection>
  );
}

function AddRefSection({ parent }) {
  const cloud = useCloud();
  let [isOpened, setIsOpened] = useState(false);
  let [newRefName, setNewRefName] = useState('');
  function submit() {
    const newRefFullName = parent ? `${parent}/${newRefName}` : newRefName;
    cloud.get(newRefFullName).put(null);
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
      <LinkRow
        key="my-account"
        title="My Account"
        isSelected={false}
        onPress={() => {
          navigate('Account');
        }}
      />
      <RefsList parent={null} activeRef={activeRef} />
      <AddRefSection parent={null} />
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

function PrimitivePane({ value, onValue }) {
  return (
    <Pane>
      <Text>{value}</Text>
      <DestroyButton onValue={onValue} />
      <SetTypeSection value={value} onValue={onValue} />
    </Pane>
  );
}

function AddKeySection({ value, onValue }) {
  let [isOpened, setIsOpened] = useState(false);
  let [keyName, setKeyName] = useState('');
  function submit() {
    onValue({ ...value, [keyName]: null });
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

function SetTypeSection({ value, onValue }) {
  let [isOpened, setIsOpened] = useState(false);
  function submit() {}
  if (isOpened) {
    return (
      <Form>
        <OptionField options={[]} onValue={() => {}} value={null} />
        <FormButton title="Set Type" onPress={submit} />
        <FormButton
          title="Cancel"
          secondary
          onPress={() => {
            setIsOpened(false);
          }}
        />
      </Form>
    );
  }
  return (
    <StandaloneButton
      title="Change Type"
      onPress={() => {
        setIsOpened(true);
      }}
    />
  );
}

function RowValue({ value }) {
  let type = typeof value;
  if (value == null) {
    return <Text>Empty</Text>;
  }
  if (type !== 'boolean' && type !== 'string' && type !== 'number') {
    return null;
  }
  return <Text>{JSON.stringify(value)}</Text>;
}

function DestroyButton({ onValue }) {
  return (
    <StandaloneButton
      title="Destroy"
      onPress={() => {
        onValue(null);
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
  let rows = null;

  if (value instanceof Array) {
    rows = value.map((value, index) => (
      <LinkRow
        key={index}
        tintColor="red"
        isSelected={nextPathSegment == index}
        title={`#${index}`}
        onPress={() => {
          const nextPath = [...pathContext, String(index)].join('/');
          navigation.setParams({
            refPath: nextPath,
          });
        }}
      >
        <RowValue value={value} />
      </LinkRow>
    ));
  } else {
    rows = Object.keys(value).map(objKey => (
      <LinkRow
        key={objKey}
        tintColor={isPrimitive(value[objKey]) ? '#311' : 'black'}
        isSelected={nextPathSegment === objKey}
        title={objKey}
        onPress={() => {
          const nextPath = [...pathContext, objKey].join('/');
          navigation.setParams({
            refPath: nextPath,
          });
        }}
      >
        <RowValue value={value[objKey]} />
      </LinkRow>
    ));
  }
  return (
    <React.Fragment>
      <Pane>
        <RowSection>{rows}</RowSection>

        <DestroyButton onValue={onValue} />
        <SetTypeSection value={value} onValue={onValue} />
        <AddKeySection value={value} onValue={onValue} />
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
  if (isPrimitive(presentationValue)) {
    return (
      <PrimitivePane
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

  const cloudRef = cloud.get(name);
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
  return nameParts.map(name => <RefMetaPane name={name} key={name} />);
}

function RefMetaPane({ name }) {
  const { navigate, getParam } = useNavigation();
  const cloud = useCloud();
  const cloudRef = cloud.get(name);
  const r = useObservable(cloudRef.observe);
  const activeRef = getParam('refName');

  return (
    <Pane>
      <Title title={cloudRef.getName()} />
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
      <AddRefSection parent={name} />
    </Pane>
  );
}

function AccountPane() {
  const cloud = useCloud();
  const session = useObservable(cloud.observeSession);
  return (
    <Pane>
      <Title title={'My account'} />
      {session && <InfoSection text={session.accountId} />}
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
    Account: {
      path: 'account',
      screen: AccountPane,
    },
  }),
  {
    explicitParams: true,
  },
);

function MainPane({ onClientConfig, onSession, navigation }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        flex: 1,
      }}
    >
      <RefsPane onClientConfig={onClientConfig} onSession={onSession} />
      <MainPaneNavigator navigation={navigation} />
    </View>
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
      {children}
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
          <ScrollView
            horizontal
            style={{
              ...StyleSheet.absoluteFillObject,
            }}
            contentContainerStyle={{
              minWidth: '100%',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
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
