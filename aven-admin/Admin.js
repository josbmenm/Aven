import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  AsyncStorage
} from "react-native";
import React, { useState, useEffect, useMemo } from "react";

import useCloud from "../aven-cloud/useCloud";
import useRefValue from "../aven-cloud/useRefValue";
import createBrowserNetworkSource from "../aven-cloud-browser/createBrowserNetworkSource";
import createCloudClient from "../aven-cloud/createCloudClient";
import CloudContext from "../aven-cloud/CloudContext";
import JSONView from "../debug-views/JSONView";
import useObservable from "../aven-cloud/useObservable";
import { useNavigationState, useNavigation } from "react-navigation-hooks";
import {
  SwitchRouter,
  createNavigator,
  NavigationContext
} from "@react-navigation/core";

function useActiveRoute() {
  const state = useNavigationState();

  return state.routes[state.index];
}

function useAsyncStorage(storageKey, defaultValue) {
  const unloadedValue = {};
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
    [storageKey]
  );

  function setStorageState(updates) {
    if (storageState === unloadedValue) {
      throw new Error(
        "Cannot merge storage state if it has not been loaded yet!"
      );
    }
    const newState = { ...storageState, ...updates };
    setInternalStorageState(newState);
    AsyncStorage.setItem(storageKey, JSON.stringify(newState)).catch(
      console.error
    );
  }

  return [storageState, setStorageState];
}

function Hero({ title }) {
  return (
    <Text
      style={{
        fontSize: 80,
        textAlign: "center",
        fontWeight: "300",
        marginVertical: 30,
        color: "#343",
        paddingHorizontal: 15
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
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 15
      }}
    >
      {title.split(".").map((t, i, a) => (
        <Text
          key={i}
          style={{
            fontSize: 36,
            textAlign: "center",
            fontWeight: "300",
            color: "#343"
          }}
        >
          {t}
          {i === a.length - 1 ? "" : "."}
        </Text>
      ))}
    </View>
  );
}

const Styles = {
  inputHeight: 50,
  highlightColor: "#027C6F",
  labelColor: "#222",
  rowBorderColor: "#ccc"
};

function Button({ onPress, title, style, secondary }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          backgroundColor: secondary ? "#ccc" : Styles.highlightColor,
          height: Styles.inputHeight,
          borderRadius: Styles.inputHeight / 2,
          paddingHorizontal: 25,
          paddingVertical: 7,
          ...style
        }}
      >
        <Text
          style={{
            color: secondary ? "#333" : "white",
            textAlign: "center",
            fontSize: 28
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
        fontWeight: "bold",
        fontSize: 14
      }}
    >
      {label}
    </Text>
  );
}

function InputField({ name, value, onValue }) {
  return (
    <View style={{ paddingVertical: 8 }}>
      <FieldLabel label={name} />
      <TextInput
        value={value}
        onChangeText={onValue}
        style={{
          backgroundColor: "white",
          height: Styles.inputHeight,
          borderRadius: Styles.inputHeight / 2,
          paddingHorizontal: 20,
          paddingVertical: 5,
          marginTop: 4
        }}
      />
    </View>
  );
}

function BooleanField({ name, value, onValue }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 15
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
        backgroundColor: "#0001"
      }}
    >
      {children}
    </View>
  );
}

function LoginForm({ onClientConfig, defaultSession }) {
  const [authority, setAuthority] = useState(defaultSession.authority);
  const [domain, setDomain] = useState(defaultSession.domain);
  const [useSSL, setUseSSL] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { navigate } = useNavigation();
  if (isConnecting) {
    return <Text>One moment..</Text>;
  }
  return (
    <Form>
      <InputField value={authority} onValue={setAuthority} name="Authority" />
      <InputField value={domain} onValue={setDomain} name="Domain" />
      <BooleanField value={useSSL} onValue={setUseSSL} name="Use HTTPS" />
      <FormButton
        title="Connect"
        onPress={() => {
          setIsConnecting(true);
          onClientConfig({
            authority,
            useSSL,
            domain
          });
          navigate("Home");
        }}
      />
    </Form>
  );
}

function Pane({ children }) {
  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: "#f0f0f0",
        borderRightWidth: StyleSheet.hairlineWidth,
        borderRightColor: "#aaa",
        maxWidth: 350
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
        backgroundColor: "#f0f0f0",
        borderRightWidth: StyleSheet.hairlineWidth,
        borderRightColor: "#aaa"
      }}
    >
      {children}
    </ScrollView>
  );
}

function LoginPane({ onClientConfig, defaultSession }) {
  return (
    <Pane>
      <Hero title="Login" />
      <View>
        <LoginForm
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
        borderTopColor: Styles.rowBorderColor
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
        backgroundColor: isSelected ? "#96F3E9" : "white",
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Styles.rowBorderColor
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
            color: isHighlighted ? "black" : "#222"
          }}
        >
          {title}
        </Text>
      </Row>
    </TouchableOpacity>
  );
}

function RefsList() {
  const cloud = useCloud();
  const { navigate } = useNavigation();
  const activeRef = useParam("name");
  const refs = useObservable(cloud.observeRefs);

  if (!refs) {
    return null;
  }
  return (
    <RowSection>
      {refs.filter(r => !r.getState().isDestroyed).map(ref => (
        <LinkRow
          key={ref.name}
          isSelected={ref.name === activeRef}
          title={ref.name}
          onPress={() => {
            navigate("Ref", { name: ref.name });
          }}
        />
      ))}
    </RowSection>
  );
}

function AddRefSection() {
  const cloud = useCloud();
  let [isOpened, setIsOpened] = useState(false);
  let [newRefName, setNewRefName] = useState("");
  if (isOpened) {
    return (
      <Form>
        <InputField
          value={newRefName}
          onValue={setNewRefName}
          name="New Ref Name"
        />
        <FormButton
          title="Create Ref"
          onPress={() => {
            cloud.getRef(newRefName).put(null);
            setIsOpened(false);
            setNewRefName("");
          }}
        />
        <FormButton
          title="Cancel"
          secondary
          onPress={() => {
            setIsOpened(false);
            setNewRefName("");
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

function RefsPane({ onClientConfig }) {
  const { domain } = useCloud();
  const { navigate } = useNavigation();
  return (
    <Pane>
      <Title title={domain} />
      <RefsList />
      <AddRefSection />
      <StandaloneButton
        title="Log out"
        onPress={() => {
          onClientConfig(null);
          navigate("Login");
        }}
      />
    </Pane>
  );
}

function Folder({ value, path, cloudRef, pathContext }) {
  let pathViews = null;
  const navigation = useNavigation();

  const pathSegments = path && path.split("/");
  const nextPathSegment = pathSegments && pathSegments[0];
  const restOfPath = pathSegments && pathSegments.slice(1).join("/");

  const file = value.files[nextPathSegment];
  const obj = useMemo(
    () => {
      if (!file || !file.id) {
        return null;
      }
      return cloudRef.getObject(file.id);
    },
    [file]
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
                const nextPath = [...pathContext, fileName].join("/");
                console.log(nextPath);
                navigation.setParams({
                  path: nextPath
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
  while (val === undefined && parent && parent.getParam) {
    val = parent.getParam(paramName);
    parent = parent.dangerouslyGetParent();
  }
  return val;
}

function ValuePane({ value, path, cloudRef, pathContext }) {
  if (value == null) {
    return <Text>Empty</Text>;
  }
  if (value.type === "Folder") {
    return (
      <Folder
        value={value}
        path={path}
        cloudRef={cloudRef}
        pathContext={pathContext}
      />
    );
  }
  return (
    <LargePane>
      <Title title={`${cloudRef.name}/${pathContext.join("/")}`} />
      <JSONView data={value} />
      <StandaloneButton
        title="Modify"
        onPress={() => {
          cloudRef.put({ other: "value" });
        }}
      />
    </LargePane>
  );
}

function RefValuePane() {
  const name = useParam("name");
  const path = useParam("path");
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
  let [nextId, setNextId] = useState(r ? r.id : "");
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
  return (
    <Form>
      <InputField value={nextId} onValue={setNextId} name="New ID" />
      <FormButton
        title="Set ID"
        onPress={() => {
          setIsOpened(false);
          setNextId(null);
          cloudRef.putId(nextId).catch(e => {
            alert("Error");
            console.error(e);
          });
        }}
      />
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

function RefMetaPane() {
  const { navigate } = useNavigation();
  const name = useParam("name");
  const cloud = useCloud();
  const cloudRef = cloud.getRef(name);
  const r = useObservable(cloudRef.observe);
  return (
    <Pane>
      <Title title={cloudRef.name} />
      {r && <InfoSection text={`Current ID: ${r.id}`} />}
      <StandaloneButton
        title="Destroy"
        onPress={() => {
          navigate("Refs");
          cloud.destroyRef(cloudRef).catch(console.error);
        }}
      />
      <RefSetForm cloudRef={cloudRef} />
    </Pane>
  );
}

const RefPaneNavigator = createNavigator(
  SlideableNavigation,
  SwitchRouter({
    RefValue: { path: "value/:path*", screen: RefValuePane }
  }),
  {}
);

function RefPane({ onClientConfig, navigation }) {
  return (
    <React.Fragment>
      <RefMetaPane />
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
    Refs: { path: "", screen: EmptyScreen },
    Ref: {
      path: "ref/:name",
      screen: RefPane
    }
  }),
  {}
);

function MainPane({ onClientConfig, navigation }) {
  return (
    <React.Fragment>
      <RefsPane onClientConfig={onClientConfig} />
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
        source={require("./BgTexture.png")}
      />
      <View style={{ ...StyleSheet.absoluteFillObject, flexDirection: "row" }}>
        {children}
      </View>
    </View>
  );
}

function AdminApp({ defaultSession = {}, descriptors }) {
  let [sessionState, setSessionState] = useAsyncStorage("AvenSession", {
    clientConfig: null
  });
  let client = useMemo(
    () => {
      if (!sessionState.clientConfig) {
        return null;
      }

      const { authority, useSSL, domain } = sessionState.clientConfig;

      const dataSource = createBrowserNetworkSource({
        authority,
        useSSL
      });

      const client = createCloudClient({
        dataSource,
        domain
      });

      return client;
    },
    [sessionState.clientConfig]
  );

  const activeRoute = useActiveRoute();

  const { navigate } = useNavigation();

  useEffect(
    () => {
      if (
        sessionState.clientConfig !== undefined &&
        !client &&
        activeRoute.routeName !== "Login"
      ) {
        navigate("Login");
      }
    },
    [sessionState, client]
  );

  function setClientConfig(clientConfig) {
    setSessionState({ clientConfig });
  }

  const activeDescriptor = descriptors[activeRoute.key];

  const ScreenComponent = activeDescriptor.getComponent();

  if (!client && activeRoute.routeName !== "Login") {
    return <Text>Wait..</Text>;
  }

  return (
    <BackgroundView>
      <CloudContext.Provider value={client}>
        <NavigationContext.Provider value={activeDescriptor.navigation}>
          <ScreenComponent
            onClientConfig={setClientConfig}
            defaultSession={{
              authority: defaultSession.authority || "localhost:3000",
              domain: defaultSession.domain || "test.aven.cloud"
            }}
            navigation={activeDescriptor.navigation}
          />
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

const router = SwitchRouter({
  Home: {
    path: "",
    screen: MainPane,
    navigationOptions: {
      title: "Admin"
    }
  },
  Login: {
    path: "login",
    screen: LoginPane,
    navigationOptions: {
      title: "Login - Admin"
    }
  }
});

export default createNavigator(AdminApp, router, {});
