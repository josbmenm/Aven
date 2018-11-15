import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import React, { useState, useEffect } from "react";

import useCloud from "../aven-cloud/useCloud";
import useRefValue from "../aven-cloud/useRefValue";
import createBrowserNetworkSource from "../aven-cloud-browser/createBrowserNetworkSource";
import createCloudClient from "../aven-cloud/createCloudClient";
import CloudContext from "../aven-cloud/CloudContext";
import JSONView from "../debug-views/JSONView";

function Hero({ title }) {
  return (
    <Text
      style={{
        fontSize: 80,
        textAlign: "center",
        fontWeight: "300",
        marginVertical: 30,
        color: "#343"
      }}
    >
      {title}
    </Text>
  );
}

const Styles = {
  inputHeight: 50,
  highlightColor: "#027C6F",
  labelColor: "#222"
};

function Button({ onPress, title, style }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          backgroundColor: Styles.highlightColor,
          height: Styles.inputHeight,
          borderRadius: Styles.inputHeight / 2,
          paddingHorizontal: 25,
          paddingVertical: 7,
          ...style
        }}
      >
        <Text
          style={{
            color: "white",
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

function FormSubmitButton(props) {
  return <Button {...props} style={{ marginTop: 30 }} />;
}

function FieldLabel({ label, onPress }) {
  return (
    <Text
      onPress={onPress}
      style={{ color: Styles.labelColor, fontWeight: "bold", fontSize: 14 }}
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
          paddingHorizontal: 25,
          paddingVertical: 10,
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

function LoginForm({ onClient }) {
  const [authority, setAuthority] = useState("localhost:3000");
  const [domain, setDomain] = useState("example.aven.cloud");
  const [useSSL, setUseSSL] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  if (isConnecting) {
    return <Text>One moment..</Text>;
  }
  return (
    <React.Fragment>
      <InputField value={authority} onValue={setAuthority} name="Authority" />
      <InputField value={domain} onValue={setDomain} name="Domain" />
      <BooleanField value={useSSL} onValue={setUseSSL} name="Use HTTPS" />
      <FormSubmitButton
        title="Connect"
        onPress={() => {
          setIsConnecting(true);

          const dataSource = createBrowserNetworkSource({
            authority,
            useSSL
          });

          const client = createCloudClient({
            dataSource,
            domain
          });
          onClient(client);
        }}
      />
    </React.Fragment>
  );
}

function Pane({ children }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#f0f0f0",
        padding: 20,
        borderRightWidth: StyleSheet.hairlineWidth,
        borderRightColor: "#aaa"
      }}
    >
      {children}
    </View>
  );
}

function LoginPane({ onClient }) {
  return (
    <Pane>
      <Hero title="Login" />
      <View>
        <LoginForm onClient={onClient} />
      </View>
    </Pane>
  );
}

function PlaceholderMainPane({ title }) {
  return (
    <View style={{ flex: 4 }}>
      <Hero title={title} />
    </View>
  );
}

function LinkRow({ title, onPress, isSelected }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={{ padding: 8 }}>
        <Text
          style={{
            color: isSelected ? "blue" : "black"
          }}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function RefsList({ activeRef, onActiveRef }) {
  const cloud = useCloud();
  const [refs, setRefs] = useState(null);
  useEffect(
    () => {
      cloud
        .dispatch({
          type: "ListRefs",
          domain: cloud.domain
        })
        .then(r => {
          setRefs(r);
        })
        .catch(console.error);

      return () => {};
    },
    [1]
  );
  if (!refs) {
    return null;
  }
  return (
    <View>
      {refs.map(ref => (
        <LinkRow
          isSelected={ref === activeRef}
          title={ref}
          onPress={() => {
            onActiveRef(ref);
          }}
        />
      ))}
    </View>
  );
}

function RefsPane({ onLogout, activeRef, onActiveRef }) {
  const cloud = useCloud();
  return (
    <Pane>
      <RefsList activeRef={activeRef} onActiveRef={onActiveRef} />
      <Button
        title="Create foo"
        onPress={() => {
          cloud.getRef("foo").put({ hello: "world" });
        }}
      />
      <Button title="Log out" onPress={onLogout} />
    </Pane>
  );
}

function Folder({ value }) {
  return (
    <Pane>
      {Object.keys(value.files).map(fileName => (
        <Text>{fileName}</Text>
      ))}
    </Pane>
  );
}

function RefScreen({ value, cloudRef }) {
  if (value == null) {
    return <Text>Empty</Text>;
  }
  if (value.type === "Folder") {
    return <Folder value={value} />;
  }
  return (
    <React.Fragment>
      <JSONView data={value} />
      <Button
        title="Modify"
        onPress={() => {
          cloudRef.put({ other: "value" });
        }}
      />
    </React.Fragment>
  );
}

function RefPane({ name }) {
  const cloudRef = useCloud().getRef(name);
  const value = useRefValue(cloudRef);
  return (
    <View style={{ flex: 4 }}>
      <RefScreen value={value} cloudRef={cloudRef} />
    </View>
  );
}

function MainPane({ activeRef }) {
  if (!activeRef) {
    return <PlaceholderMainPane title="Select a ref" />;
  }
  return <RefPane name={activeRef} />;
}

export default function App({ env }) {
  let [client, setClient] = useState(null);
  let [activeRef, setActiveRef] = useState(null);
  if (!client) {
    return (
      <View style={{ flex: 1, flexDirection: "row" }}>
        <LoginPane onClient={setClient} />
        <PlaceholderMainPane title="" />
      </View>
    );
  }
  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      <CloudContext.Provider value={client}>
        <RefsPane
          activeRef={activeRef}
          onLogout={() => {
            setClient(null);
            setActiveRef(null);
          }}
          onActiveRef={setActiveRef}
        />
        <MainPane activeRef={activeRef} />
      </CloudContext.Provider>
    </View>
  );
}
