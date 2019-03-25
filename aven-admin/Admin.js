import {
  createNavigator,
  NavigationContext,
  SwitchRouter,
} from '../navigation-core';
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useContext,
  createContext,
} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useNavigation, useNavigationState } from '../navigation-hooks/Hooks';

import createBrowserNetworkSource from '../cloud-browser/createBrowserNetworkSource';
import CloudContext from '../cloud-core/CloudContext';
import createCloudClient from '../cloud-core/createCloudClient';
import useCloud from '../cloud-core/useCloud';
import useCloudSession from '../cloud-core/useCloudSession';
import useObservable from '../cloud-core/useObservable';
import useCloudValue from '../cloud-core/useCloudValue';
import ErrorContainer from '../cloud-react/ErrorContainer';
import JSONView from '../debug-views/JSONView';
import useAsyncStorage, { isStateUnloaded } from '../utils/useAsyncStorage';
import { TouchableHighlight } from 'react-native-web';
const pathJoin = require('path').join;

function useActiveRoute() {
  const state = useNavigationState();

  return state.routes[state.index];
}

function isPrimitive(v) {
  const t = typeof v;
  return v === null || t === 'boolean' || t === 'string' || t === 'number';
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

function Pane({ children, pageColor }) {
  return (
    <ScrollView
      style={{
        backgroundColor: pageColor || '#fff',
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

function AuthProviderInput({
  onSubmit,
  verificationChallenge,
  loginInfo,
  onLoginInfo,
}) {
  const [mode, setMode] = useState('root');
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
    const resp = await cloud.createSession({
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
      <AuthProviderInput
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

function DocsList({ parent, activeDoc }) {
  const cloud = useCloud();
  const { navigate } = useNavigation();
  const listParent = parent ? cloud.get(parent) : cloud;
  const docs = useObservable(listParent.observeDocChildren);
  if (!docs) {
    return null;
  }
  return (
    <RowSection>
      {docs
        .filter(r => !r.getState().isDestroyed)
        .map(doc => {
          const localName = doc.getName();
          const docName = parent ? pathJoin(parent, localName) : localName;
          const matchingDoc = activeDoc && activeDoc.match(docName);
          const isSelected = !!matchingDoc && matchingDoc.index === 0;
          return (
            <LinkRow
              key={localName}
              isSelected={isSelected}
              title={localName}
              onPress={() => {
                navigate('Doc', { docName, docPath: null });
              }}
            />
          );
        })}
    </RowSection>
  );
}

function AddDocSection({ parent }) {
  const cloud = useCloud();
  let [isOpened, setIsOpened] = useState(false);
  let [newDocName, setNewDocName] = useState('');
  function submit() {
    const newDocFullName = parent ? `${parent}/${newDocName}` : newDocName;
    cloud.get(newDocFullName).put(null);
    setIsOpened(false);
    setNewDocName('');
  }
  if (isOpened) {
    return (
      <Form>
        <InputField
          value={newDocName}
          onValue={setNewDocName}
          name="New Doc Name"
          onSubmit={submit}
        />
        <FormButton title="Create Doc" onPress={submit} />
        <FormButton
          title="Cancel"
          secondary
          onPress={() => {
            setIsOpened(false);
            setNewDocName('');
          }}
        />
      </Form>
    );
  }
  return (
    <StandaloneButton
      title="Create Doc"
      onPress={() => {
        setIsOpened(true);
      }}
    />
  );
}

function DocsPane({ onClientConfig, onSession }) {
  const { domain, destroySession } = useCloud();
  const { navigate, state } = useNavigation();
  const docRoute =
    state.routes && state.routes.find(r => r.routeName === 'Doc');
  const activeDoc = docRoute && docRoute.params.docName;
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
      <DocsList parent={null} activeDoc={activeDoc} />
      <AddDocSection parent={null} />
      <StandaloneButton
        title="Log out"
        onPress={() => {
          destroySession();
          onClientConfig(null);
          onSession(null);
          navigate('Login');
        }}
      />
    </Pane>
  );
}

function Folder({ value, path, doc, pathContext }) {
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
      return doc.getBlock(file.id);
    },
    [file],
  );
  const objValue = useObservable(obj && obj.observeValue);

  if (objValue) {
    pathViews = (
      <ValuePane
        value={objValue}
        onValue={v => doc.put(v)}
        path={restOfPath}
        doc={doc}
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
                  docPath: nextPath,
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

function PrimitivePane({ value, onValue }) {
  return (
    <Pane>
      <Text>{JSON.stringify(value)}</Text>
      <DestroyButton onValue={onValue} />
      <SetTypeSection value={value} onValue={onValue} />
    </Pane>
  );
}

const PopoverContext = createContext(null);

function PopoverOverlay({ children, location, onClose }) {
  console.log('location, location', location);
  return (
    <React.Fragment>
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={{ backgroundColor: '#2228', ...StyleSheet.absoluteFillObject }}
        />
      </TouchableWithoutFeedback>
      <View
        style={{
          width: 400,
          height: 400,
          position: 'absolute',
          left: location.pageX,
          top: location.pageY,
        }}
      >
        {children}
      </View>
    </React.Fragment>
  );
}

function PopoverContainer({ children }) {
  let [popover, setPopover] = useState(null);
  let [popoverLocation, setLocation] = useState({});
  let popoverContext = {
    openPopover: (popover, location) => {
      setLocation(location || {});
      setPopover(popover);
    },
  };

  return (
    <PopoverContext.Provider value={popoverContext}>
      <View style={{ flex: 1 }}>
        {children}
        {popover && (
          <PopoverOverlay
            location={popoverLocation}
            onClose={() => {
              setPopover(null);
            }}
          >
            {popover}
          </PopoverOverlay>
        )}
      </View>
    </PopoverContext.Provider>
  );
}
process.env.REACT_NAV_LOGGING = true;

function usePopover() {
  const target = useRef(null);
  const context = useContext(PopoverContext);
  function openPopover(view, location) {
    if (!context) {
      throw new Error('no popover context!');
    }
    context.openPopover(view, location);
  }
  return { openPopover, target };
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
    <React.Fragment>
      <StandaloneButton
        title="Add Key"
        onPress={() => {
          setIsOpened(true);
        }}
      />
    </React.Fragment>
  );
}

function getType(a) {
  if (a === null) {
    return 'null';
  }
  if (typeof a !== 'object') {
    return typeof a;
  }
  if (Array.isArray(a)) {
    return 'array';
  }
  return 'object';
}

function SetTypeSection({ value, onValue }) {
  let [isOpened, setIsOpened] = useState(false);
  let [nextType, setNextType] = useState(getType(value));
  function submit() {
    let nextValue = null;
    if (nextType === 'boolean') {
      nextValue = !!value;
    } else if (nextType === 'string') {
      nextValue =
        typeof value === 'object' ? JSON.stringify(value) : String(value);
    } else if (nextType === 'number') {
      nextValue = Number(value);
    } else if (nextType === 'array') {
      nextValue = [];
    } else if (nextType === 'object') {
      nextValue = {};
    }
    onValue(nextValue);
    setIsOpened(false);
  }
  if (isOpened) {
    return (
      <Form>
        <OptionField
          options={[
            { value: 'null', label: 'Null' },
            { value: 'array', label: 'Array' },
            { value: 'number', label: 'Number' },
            { value: 'string', label: 'String' },
            { value: 'boolean', label: 'Boolean' },
            { value: 'object', label: 'Object' },
          ]}
          onValue={setNextType}
          value={nextType}
        />
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
  if (Array.isArray(value)) {
    return <Text>[{value.length}]</Text>;
  }
  if (type === 'object') {
    const keys = Object.keys(value);
    if (keys.length > 3) {
      return <Text children={`{${keys.slice(0, 3).join()}...}`} />;
    } else {
      return <Text children={`{${keys.join()}}`} />;
    }
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

function ObjectPane({ path, value, onValue, pathContext, doc }) {
  let pathViews = null;

  const navigation = useNavigation();
  const pathSegments = path && path.split('/');
  const nextPathSegment = pathSegments && pathSegments[0];
  const restOfPath = pathSegments && pathSegments.slice(1).join('/');
  const pathValue = nextPathSegment != null && value[nextPathSegment];

  if (pathValue !== undefined) {
    pathViews = (
      <ValuePane
        value={pathValue}
        path={restOfPath}
        doc={doc}
        onValue={v => {
          onValue({
            ...value,
            [nextPathSegment]: v,
          });
        }}
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
            docPath: nextPath,
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
            docPath: nextPath,
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

function ValuePane({ value, onValue, path, doc, pathContext }) {
  if (value === undefined) {
    return <Text>Loading</Text>;
  }
  if (isPrimitive(value)) {
    return <PrimitivePane value={value} onValue={onValue} />;
  }
  if (value.type === 'Folder') {
    return (
      <Folder value={value} path={path} doc={doc} pathContext={pathContext} />
    );
  }

  if (typeof value === 'object') {
    return (
      <ObjectPane
        value={value}
        path={path}
        doc={doc}
        pathContext={pathContext}
        onValue={onValue}
      />
    );
  }
  throw new Error('Bad type!');
}

function DocValuePane() {
  const name = useParam('docName');
  const path = useParam('docPath');
  const cloud = useCloud();

  const doc = cloud.get(name);
  const value = useCloudValue(doc);

  return (
    <ValuePane
      doc={doc}
      value={value}
      onValue={v => doc.put(v)}
      path={path}
      pathContext={[]}
    />
  );
}

function InfoSection({ text }) {
  return (
    <Text style={{ paddingHorizontal: 15, paddingVertical: 5 }}>{text}</Text>
  );
}

function DocSetIDForm({ doc }) {
  const r = useObservable(doc.observe);

  let [isOpened, setIsOpened] = useState(false);
  let [nextId, setNextId] = useState(r ? r.id : '');
  if (!isOpened) {
    return (
      <StandaloneButton
        title="Set Block ID"
        onPress={() => {
          setIsOpened(true);
        }}
      />
    );
  }
  function submit() {
    setIsOpened(false);
    setNextId(null);
    doc.putId(nextId).catch(e => {
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

function DocMetaPanes() {
  const name = useParam('docName');
  const nameParts = pathApartName(name);
  return nameParts.map(name => <DocMetaPane name={name} key={name} />);
}

function DocMetaPane({ name }) {
  const { navigate, getParam } = useNavigation();
  const cloud = useCloud();
  const doc = cloud.get(name);
  const r = useObservable(doc.observe);
  const activeDoc = getParam('docName');

  return (
    <Pane>
      <Title title={doc.getName()} />
      {r && <InfoSection text={` ID: ${r.id}`} />}
      <StandaloneButton
        title="Destroy"
        onPress={() => {
          navigate('Docs');
          cloud.destroyDoc(doc).catch(console.error);
        }}
      />
      <DocSetIDForm doc={doc} />
      <DocsList parent={name} activeDoc={activeDoc} />
      <AddDocSection parent={name} />
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
      <StandaloneButton title="Set Username" onPress={() => {}} />
      <StandaloneButton
        title="Add Email Address"
        onPress={() => {
          // cloud
          //   .dispatch({
          //     type: 'PutAuthProvider',
          //     verificationInfo: {
          //       email: 'eric@onofood.co',
          //     },
          //     verificationResponse: null,
          //   })
          //   .then(() => {
          //     console.log('auth put done!');
          //   })
          //   .catch(console.error);
        }}
      />
      <StandaloneButton title="Add Phone Number" onPress={() => {}} />
    </Pane>
  );
}

const DocPaneNavigator = createNavigator(
  SlideableNavigation,
  SwitchRouter({
    DocValue: {
      path: 'value',
      screen: DocValuePane,
      params: { docPath: '' },
      inheritParams: ['docName'],
    },
  }),
  {
    explicitParams: true,
  },
);

function DocPane({ navigation }) {
  return (
    <React.Fragment>
      <DocMetaPanes />
      <DocPaneNavigator navigation={navigation} />
    </React.Fragment>
  );
}
DocPane.router = DocPaneNavigator.router;

function EmptyScreen() {
  return null;
}

const MainPaneNavigator = createNavigator(
  SlideableNavigation,
  SwitchRouter({
    Docs: { path: '', screen: EmptyScreen },
    Doc: {
      path: 'doc',
      screen: DocPane,
      params: { docName: null },
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
      <DocsPane onClientConfig={onClientConfig} onSession={onSession} />
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

function ErrorPage({ error, errorInfo, onRetry }) {
  return (
    <View>
      <Text>Whoops! {error.message}</Text>
      <Text>{errorInfo}</Text>
      <TouchableHighlight onPress={onRetry}>
        <Text>Try again</Text>
      </TouchableHighlight>
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
      if (
        isStateUnloaded(clientConfig) ||
        isStateUnloaded(sessionState) ||
        clientConfig === null
      ) {
        return null;
      }
      const { authority, useSSL, domain } = clientConfig;
      const source = createBrowserNetworkSource({
        authority,
        useSSL,
      });
      const client = createCloudClient({
        initialSession: sessionState,
        source,
        domain,
      });

      return client;
    },
    [clientConfig, isStateUnloaded(sessionState)],
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

  function handleCatch(e, i, onRetry) {
    if (e.type === 'SessionInvalid') {
      client.destroySession();
      setSessionState(null);
      onRetry();
    }
    console.log('bad news:', e);
  }

  return (
    <PopoverContainer>
      <ErrorContainer
        onCatch={handleCatch}
        renderError={({ onRetry, error }) => (
          <ErrorPage onRetry={onRetry} error={error} />
        )}
      >
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
                  authority: defaultSession.authority,
                  domain: defaultSession.domain,
                }}
                navigation={activeDescriptor.navigation}
              />
            </ScrollView>
          </NavigationContext.Provider>
        </CloudContext.Provider>
      </ErrorContainer>
    </PopoverContainer>
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
