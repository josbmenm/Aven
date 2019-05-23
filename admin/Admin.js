import {
  createNavigator,
  NavigationContext,
  SwitchRouter,
} from '../navigation-core';
import React, {
  useEffect,
  useMemo,
  useState,
  createContext,
  useContext,
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
  Easing,
  TouchableHighlight,
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
import Animated from '../views/Animated';
import useAsyncStorage, { isStateUnloaded } from '../utils/useAsyncStorage';
import {
  usePopover,
  PopoverContainer,
  useTargetPopover,
} from '../views/Popover';

const prettyShadow = {
  shadowOffset: { width: 0, height: 0 },
  shadowColor: 'black',
  shadowOpacity: 0.1,
  shadowRadius: 22,
};
const prettyShadowSmall = {
  shadowOffset: { width: 0, height: 0 },
  shadowColor: 'black',
  shadowOpacity: 0.06,
  shadowRadius: 11,
};

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
  headerBackground: '#E5E9ED',
  headerBorder: '#CCC',
  headerLinkColor: '#D0D8DF',
  headerFontSize: 24,
  inputHeight: 50,
  highlightColor: '#025C7F',
  labelColor: '#222',
  rowTextColor: '#222',
  rowBorderColor: '#ccc',
  rowBackgroundColor: 'white',
  rowBackgroundHoverColor: '#eaecff',
};

const StyleContext = createContext(Styles);
function useStyles() {
  return useContext(StyleContext);
}

function Button({ onPress, title, style, secondary }) {
  const styles = useStyles();
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          backgroundColor: secondary ? '#ccc' : styles.highlightColor,
          height: styles.inputHeight,
          borderRadius: styles.inputHeight / 2,
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

function Pane({ children, pageColor }) {
  return (
    <ScrollView
      style={{
        backgroundColor: pageColor || '#fff',
        width: 300,
        ...prettyShadow,
      }}
    >
      {children}
    </ScrollView>
  );
}

// function LargePane({ children }) {
//   return (
//     <ScrollView
//       style={{
//         flex: 4,
//         backgroundColor: '#f0f0f0',
//         borderRightWidth: StyleSheet.hairlineWidth,
//         borderRightColor: '#aaa',
//       }}
//     >
//       {children}
//     </ScrollView>
//   );
// }

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

function LoginForm({ onSession, onClientConfig, defaultSession }) {
  const [isWorking, setIsWorking] = useState(false);
  const [loginInfo, setLoginInfo] = useState(null);
  const [verificationChallenge, setVerificationChallenge] = useState(null);
  const { navigate } = useNavigation();
  const cloud = useCloud();

  const [authority, setAuthority] = useState(defaultSession.authority);
  const [domain, setDomain] = useState(defaultSession.domain);
  const [useSSL, setUseSSL] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  if (isConnecting) {
    return <Text>One moment..</Text>;
  }
  async function doLogin() {
    if (!loginInfo) {
      return;
    }
    setIsWorking(true);
    onClientConfig({
      authority,
      useSSL,
      domain,
    });
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
    }
  }
  return (
    <Form>
      {isWorking && <Text>One moment..</Text>}
      <InputField
        value={authority}
        onValue={setAuthority}
        name="Authority"
        onSubmit={doLogin}
      />
      <InputField
        value={domain}
        onValue={setDomain}
        name="Domain"
        onSubmit={doLogin}
      />
      <BooleanField value={useSSL} onValue={setUseSSL} name="Use HTTPS" />

      <AuthProviderInput
        onLoginInfo={setLoginInfo}
        loginInfo={loginInfo}
        verificationChallenge={verificationChallenge}
        onSubmit={doLogin}
      />
      <FormButton title="Login" onPress={doLogin} />
    </Form>
  );
}

function LoginPane({ onClientConfig, onSession, defaultSession }) {
  const session = useCloudSession();
  const { navigate } = useNavigation();
  if (session) {
    return (
      <Pane>
        <Hero title="Logged in" />
      </Pane>
    );
  }
  return (
    <Pane>
      <Hero title="Login" />
      <LoginForm
        onSession={session => {
          onSession(session);
          navigate('AdminHome');
        }}
        onClientConfig={onClientConfig}
        defaultSession={defaultSession}
      />
    </Pane>
  );
}

function RowSection({ children }) {
  return (
    <View
      style={{
        marginBottom: 20,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Styles.rowBorderColor,
      }}
    >
      {children}
    </View>
  );
}

function Row({ children, isSelected, isHovered }) {
  const styles = useStyles();
  return (
    <View
      style={{
        padding: 15,
        backgroundColor: isSelected
          ? styles.highlightColor
          : isHovered
          ? styles.rowBackgroundHoverColor
          : styles.rowBackgroundColor,
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
  const styles = useStyles();
  const [isHovered, setIsHovered] = useState(false);
  return (
    <TouchableOpacity
      onPress={onPress}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
    >
      <Row isSelected={isSelected} isHovered={isHovered}>
        <Text
          style={{
            fontSize: 16,
            opacity: isHovered ? 1 : 0.8,
            color: isSelected ? styles.rowBackgroundColor : styles.rowTextColor,
          }}
        >
          {title}
        </Text>
        {children}
      </Row>
    </TouchableOpacity>
  );
}

function TextInputRow({ placeholder, value, onValue, onSubmit }) {
  const styles = useStyles();
  return (
    <View
      style={{
        backgroundColor: styles.rowBackgroundColor,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: styles.rowBorderColor,
      }}
    >
      <TextInput
        style={{
          fontSize: 16,
          padding: 15,
          color: styles.rowTextColor,
        }}
        value={value}
        onChangeText={onValue}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
      />
    </View>
  );
}

function PermissionFallbackContainer({ children, renderPermissionError }) {
  if (!renderPermissionError) {
    renderPermissionError = () => <Text>No permission!</Text>;
  }
  return (
    <ErrorContainer
      renderError={() => {
        return renderPermissionError();
      }}
      canCatchError={e => {
        return e.type === 'NoPermission';
      }}
    >
      {children}
    </ErrorContainer>
  );
}

function LoadingIndicator() {
  return <Text>Loading..</Text>;
}

function DocsListWithPermission({ parent, activeDoc }) {
  const cloud = useCloud();
  const { navigate } = useNavigation();
  const listParent = parent ? cloud.get(parent) : cloud;
  const docs = useObservable(listParent.observeChildren);
  if (!docs) {
    return <LoadingIndicator />;
  }
  if (docs.length === 0) {
    return (
      <RowSection>
        <Text>0 Children Docs</Text>
      </RowSection>
    );
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

function DocsList(props) {
  return (
    <PermissionFallbackContainer>
      <DocsListWithPermission {...props} />
    </PermissionFallbackContainer>
  );
}

// function AddDocSection({ parent }) {
//   const cloud = useCloud();
//   let [isOpened, setIsOpened] = useState(false);
//   let [newDocName, setNewDocName] = useState('');
//   function submit() {
//     const newDocFullName = parent ? `${parent}/${newDocName}` : newDocName;
//     cloud.get(newDocFullName).put(null);
//     setIsOpened(false);
//     setNewDocName('');
//   }
//   if (isOpened) {
//     return (
//       <Form>
//         <InputField
//           value={newDocName}
//           onValue={setNewDocName}
//           name="New Doc Name"
//           onSubmit={submit}
//         />
//         <FormButton title="Create Doc" onPress={submit} />
//         <FormButton
//           title="Cancel"
//           secondary
//           onPress={() => {
//             setIsOpened(false);
//             setNewDocName('');
//           }}
//         />
//       </Form>
//     );
//   }
//   return (
//     <StandaloneButton
//       title="Create Doc"
//       onPress={() => {
//         setIsOpened(true);
//       }}
//     />
//   );
// }

function AddDocSection({ parent }) {
  const cloud = useCloud();
  let [newDocName, setNewDocName] = useState('');
  function submit() {
    const newDocFullName = parent ? `${parent}/${newDocName}` : newDocName;
    cloud.get(newDocFullName).put(null);
    setNewDocName('');
  }
  return (
    <RowSection>
      <TextInputRow
        placeholder="New Doc.."
        value={newDocName}
        onValue={setNewDocName}
        onSubmit={submit}
      />
    </RowSection>
  );
}

function LogoutButton() {
  const { destroySession } = useCloud();
  const { navigate } = useNavigation();
  return (
    <StandaloneButton
      title="Log out"
      onPress={() => {
        destroySession();
        navigate('Login');
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
      <RowSection>
        <LinkRow
          title="Users"
          isSelected={false}
          onPress={() => {
            navigate('Account');
          }}
        />
        <LinkRow
          title="Data Types"
          isSelected={false}
          onPress={() => {
            navigate('Account');
          }}
        />
      </RowSection>
      <DocsList parent={null} activeDoc={activeDoc} />
      <AddDocSection parent={null} />
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
  const obj = useMemo(() => {
    if (!file || !file.id) {
      return null;
    }
    return doc.getBlock(file.id);
  }, [doc, file]);
  const objValue = useObservable(obj && obj.observeValue);

  if (objValue) {
    pathViews = (
      <ValueView
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
  const { getParam } = useNavigation();
  let val = getParam(paramName);
  return val;
}

function PrimitiveView({ value, onValue }) {
  return (
    <React.Fragment>
      <Text>{JSON.stringify(value)}</Text>
      <DestroyButton onValue={onValue} />
      <SetTypeSection value={value} onValue={onValue} />
    </React.Fragment>
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

process.env.REACT_NAV_LOGGING = true;

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

function ObjectView({ path, value, onValue, pathContext, doc }) {
  let pathViews = null;

  const navigation = useNavigation();
  const pathSegments = path && path.split('/');
  const nextPathSegment = pathSegments && pathSegments[0];
  const restOfPath = pathSegments && pathSegments.slice(1).join('/');
  const pathValue = nextPathSegment != null && value[nextPathSegment];

  if (pathValue !== undefined) {
    pathViews = (
      <ValueView
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
        isSelected={nextPathSegment === index}
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
      <RowSection>{rows}</RowSection>

      <DestroyButton onValue={onValue} />
      <SetTypeSection value={value} onValue={onValue} />
      <AddKeySection value={value} onValue={onValue} />
      {pathViews}
    </React.Fragment>
  );
}

function ValueView({ value, onValue, path, doc, pathContext }) {
  if (value === undefined) {
    return <Text>Loading</Text>;
  }
  if (isPrimitive(value)) {
    return <PrimitiveView value={value} onValue={onValue} />;
  }
  if (value.type === 'Folder') {
    return (
      <Folder value={value} path={path} doc={doc} pathContext={pathContext} />
    );
  }

  if (typeof value === 'object') {
    return (
      <ObjectView
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
  if (value === null) {
    return null;
  }
  return (
    <Pane>
      <ValueView
        doc={doc}
        value={value}
        onValue={v => doc.put(v)}
        path={path}
        pathContext={[]}
      />
    </Pane>
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

function PopoverScreen(props) {
  return (
    <TouchableWithoutFeedback onPress={() => props.onClose()}>
      <Animated.View
        style={{
          ...StyleSheet.absoluteFillObject,
          opacity: props.openValue,
          backgroundColor: '#0006',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Animated.View
          style={{
            backgroundColor: 'white',
            padding: 50,
            opacity: props.openValue.interpolate({
              inputRange: [0.7, 1],
              outputRange: [0, 1],
            }),
            transform: [
              {
                translateY: props.openValue.interpolate({
                  inputRange: [0.5, 1],
                  outputRange: [75, 0],
                }),
              },
            ],
          }}
        >
          {props.children}
        </Animated.View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

function TargetedPopoverScreen({
  location,
  onClose,
  containerLayout,
  width,
  openValue,
  children,
}) {
  console.log('FFZZZ', location, containerLayout);
  return (
    <TouchableWithoutFeedback onPress={() => onClose()}>
      <Animated.View
        style={{
          ...StyleSheet.absoluteFillObject,
          opacity: openValue,
          backgroundColor: '#0006',
        }}
      >
        <Animated.View
          style={{
            position: 'absolute',
            width: width,
            top: location.y + location.height,
            right: Math.ceil(
              containerLayout.width - location.width - location.x,
            ),
            // left: 100,
            backgroundColor: 'white',
            padding: 50,
            opacity: openValue.interpolate({
              inputRange: [0.7, 1],
              outputRange: [0, 1],
            }),
            transform: [
              {
                translateY: openValue.interpolate({
                  inputRange: [0.5, 1],
                  outputRange: [75, 0],
                }),
              },
            ],
          }}
        >
          {children}
        </Animated.View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

function SetUsernamePopover(props) {
  return (
    <PopoverScreen {...props}>
      <Text>Set your username</Text>
    </PopoverScreen>
  );
}

function AccountPane() {
  const cloud = useCloud();
  const { onPopover } = usePopover(props => <SetUsernamePopover {...props} />, {
    duration: 200,
    easing: Easing.out(Easing.quad),
  });
  const session = useObservable(cloud.observeSession);
  return (
    <Pane>
      <Title title="My account" />
      {session && <InfoSection text={session.accountId} />}
      <StandaloneButton title="Set Username" onPress={onPopover} />
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
        justifyContent: 'flex-start',
      }}
    >
      <DocsPane onClientConfig={onClientConfig} onSession={onSession} />
      <MainPaneNavigator navigation={navigation} />
    </View>
  );
}
MainPane.router = MainPaneNavigator.router;

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

function HeaderLink({ children, onPress, viewRef }) {
  const styles = useStyles();
  return (
    <TouchableOpacity
      ref={viewRef}
      onPress={onPress}
      style={{
        backgroundColor: styles.headerLinkColor,
        flexDirection: 'row',
        alignSelf: 'stretch',
        alignItems: 'center',
      }}
    >
      {children}
    </TouchableOpacity>
  );
}

function AccountPopover(props) {
  return (
    <TargetedPopoverScreen {...props} width={400}>
      <Text>Your account</Text>
      <LogoutButton />
    </TargetedPopoverScreen>
  );
}

function AuthHeaderLink({ loggedInId }) {
  const styles = useStyles();
  const { onPopover, targetRef } = useTargetPopover(
    props => <AccountPopover {...props} />,
    {
      duration: 200,
      easing: Easing.out(Easing.quad),
    },
  );
  return (
    <HeaderLink onPress={onPopover} viewRef={targetRef}>
      <Text style={{ marginHorizontal: 20, fontSize: styles.headerFontSize }}>
        {loggedInId}
      </Text>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: 'green',
          marginRight: 20,
        }}
      />
    </HeaderLink>
  );
}

function AdminApp({ defaultSession = {}, descriptors }) {
  let [sessionState, setSessionState] = useAsyncStorage(
    'AvenSessionState',
    null,
  );

  let [clientConfig, setClientConfig] = useAsyncStorage(
    'AvenClientConfig',
    defaultSession,
  );

  let client = useMemo(() => {
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
  }, [clientConfig, sessionState]);

  const activeRoute = useActiveRoute();

  const { navigate } = useNavigation();

  const styles = useStyles();

  useEffect(() => {
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
  }, [activeRoute, sessionState, clientConfig, client, navigate]);

  const activeDescriptor = descriptors[activeRoute.key];

  const ScreenComponent = activeDescriptor.getComponent();

  if (!client && activeRoute.routeName !== 'Login') {
    return <Text>Wait..</Text>;
  }

  function handleCatch(e, i, onRetry) {
    if (e.type === 'SessionInvalid') {
      client.destroySession({ ignoreRemoteError: true });
      setSessionState(null);
      onRetry();
    }
  }

  const loggedInId = sessionState && sessionState.accountId;

  return (
    <PopoverContainer>
      <View
        style={{
          alignSelf: 'stretch',
          backgroundColor: styles.headerBackground,
          borderBottomWidth: 1,
          borderBottomColor: styles.headerBorder,
          flexDirection: 'row',
          justifyContent: 'space-between',
          height: 60,
        }}
      >
        <View style={{}}>
          <Image
            source={require('./assets/AvenLogo.svg')}
            style={{ width: 150, height: 33, margin: 13 }}
          />
        </View>
        {loggedInId && <AuthHeaderLink loggedInId={loggedInId} />}
      </View>
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
                flex: 1,
              }}
              contentContainerStyle={{
                minWidth: '100%',
                flexDirection: 'column',
                alignItems: 'flex-start',
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
    AdminHome: {
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
