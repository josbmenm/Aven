import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableHighlight
} from "react-native";
import React, { useState, useEffect } from "react";

import Button from "../components/Button";
import Hero from "../components/Hero";
import useCloud from "../aven-cloud/useCloud";
import useRefValue from "../aven-cloud/useRefValue";
import createBrowserNetworkSource from "../aven-cloud-browser/createBrowserNetworkSource";
import createCloudClient from "../aven-cloud/createCloudClient";
import CloudContext from "../aven-cloud/CloudContext";
import JSONView from "../debug-views/JSONView";

function InputField({ name, value, onValue }) {
  return (
    <View>
      <Text>{name}</Text>
      <TextInput
        value={value}
        onChangeText={onValue}
        style={{
          backgroundColor: "white",
          height: 50,
          borderRadius: 25,
          paddingHorizontal: 25,
          paddingVertical: 10
        }}
      />
    </View>
  );
}

function BooleanField({ name, value, onValue }) {
  return (
    <View>
      <Text>{name}</Text>
      <Switch value={value} style={{}} onValueChange={onValue} />
    </View>
  );
}

function LoginForm({ onClient }) {
  const [authority, setAuthority] = useState("localhost:8830");
  const [domain, setDomain] = useState("kitchen.maui.onofood.co");
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
      <Button
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

function LoginPane({ onClient }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#f0f0f0", padding: 20 }}>
      <Hero title="Log In" />
      <View>
        <LoginForm onClient={onClient} />
      </View>
    </View>
  );
}

function PlaceholderMainPane({ title }) {
  return (
    <View style={{ flex: 4 }}>
      <Hero title={title} />
    </View>
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
          console.log("aagh", r);
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
        <TouchableHighlight
          onPress={() => {
            onActiveRef(ref);
          }}
        >
          <Text
            style={{
              color: ref === activeRef ? "blue" : "black"
            }}
          >
            {ref}
          </Text>
        </TouchableHighlight>
      ))}
    </View>
  );
}

function RefsPane({ onLogout, activeRef, onActiveRef }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#f0f0f0", padding: 20 }}>
      <Hero title="DB Refs" />
      <RefsList activeRef={activeRef} onActiveRef={onActiveRef} />
      <Button title="Log out" onPress={onLogout} />
    </View>
  );
}

function RefPane({ name }) {
  const ref = useCloud().getRef(name);
  const value = useRefValue(ref);
  return (
    <View style={{ flex: 4 }}>
      <JSONView data={value} />
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
        <PlaceholderMainPane title="Aven Cloud" />
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
