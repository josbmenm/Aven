import React, { useEffect } from 'react';
import { useCloud } from '../cloud-core/KiteReact';
import Admin from '../admin/Admin';
import StatusDisplay from '../shoneys/StatusDisplay';
import { createSwitchNavigator } from '../navigation-core';
import { HostContextContainer } from '../components/AirtableImage';

import { View, Text } from 'react-native';
import { useCloudValue } from '../cloud-core/KiteReact';
import JSONView from '../components/JSONView';
import Button from '../components/Button';

let HOST_CONFIG = {};
if (global.window) {
  HOST_CONFIG = {
    useSSL: window.location.protocol !== 'http:',
    authority: window.location.host,
  };
}

function AdminScreen({ navigation }) {
  return (
    <Admin
      navigation={navigation}
      defaultSession={{
        ...HOST_CONFIG,
        domain: 'onofood.co',
      }}
    />
  );
}

AdminScreen.router = Admin.router;

const fontsCSS = `
@font-face {
  src: url('/fonts/Maax-Bold.ttf');
  font-family: Maax-Bold;
}
@font-face {
  src: url('/fonts/Maax.ttf');
  font-family: Maax;
}
@font-face {
  src: url('/fonts/Lora.ttf');
  font-family: Lora;
}
`;

function DebugDataRow({ data }) {
  const [isOpen, setIsOpen] = React.useState(false);
  if (!isOpen) {
    return (
      <Button
        onPress={() => {
          setIsOpen(true);
        }}
        title="Debug Data"
      />
    );
  }
  return <JSONView data={data} />;
}

function TimeRow({ label, value }) {
  if (!value) {
    return null;
  }
  const d = new Date(value);
  return (
    <View>
      <Text style={{ fontWeight: 'bold' }}>{label}</Text>
      <Text>
        {d.getHours()}:{d.getMinutes()}:{d.getSeconds()}.{d.getMilliseconds()}
      </Text>
    </View>
  );
}

function ValueRow({ label, value }) {
  return (
    <View>
      <Text style={{ fontWeight: 'bold' }}>{label}</Text>
      <Text>{value}</Text>
    </View>
  );
}

function Fills({ fills }) {
  return (
    <View style={{ marginLeft: 16, marginTop: 16 }}>
      {fills.map(fill => {
        return (
          <Text>
            <Text style={{ fontWeight: 'bold' }}>{fill.ingredientName}</Text>
            {' x '}
            {fill.amount}
          </Text>
        );
      })}
    </View>
  );
}

function OrderState({ state }) {
  return (
    <View style={{ marginBottom: 100 }}>
      <ValueRow label="Name" value={state.task.name} />
      <ValueRow label="Blend Name" value={state.task.blendName} />
      <TimeRow label={'Started'} value={state.taskStartTime} />
      <TimeRow label={'Delivery'} value={state.deliveryTime} />
      <ValueRow label="Delivery Type" value={state.deliveryType} />
      <Fills fills={state.task.fills} />
      <DebugDataRow data={state} />
    </View>
  );
}

function downloadJson(exportObj, exportName) {
  var dataStr =
    'data:text/json;charset=utf-8,' +
    encodeURIComponent(JSON.stringify(exportObj));
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', dataStr);
  downloadAnchorNode.setAttribute('download', exportName + '.json');
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

function OrderHistory() {
  const restaurantState = useCloudValue('RestaurantState');
  if (!restaurantState) return null;
  return (
    <View style={{ flex: 1 }}>
      {(restaurantState.completedTasks || []).map(completedTask => {
        return <OrderState state={completedTask} />;
      })}

      <Button
        onPress={() => {
          downloadJson(
            restaurantState,
            `RestaurantState_${new Date().toISOString()}`,
          );
        }}
        title="download restaurant backup"
      />
    </View>
  );
}

const App = createSwitchNavigator(
  {
    Admin: {
      screen: AdminScreen,
      navigationOptions: { title: 'Maui Status' },
    },
    OrderHistory,
    StatusDisplay,
  },
  {
    defaultNavigationOptions: {
      customCSS: fontsCSS,
    },
  },
);

function FullApp(props) {
  const cloud = useCloud();
  useEffect(() => {
    let hasConnectedOnce = cloud.connected.get();
    let wasConnected = hasConnectedOnce;
    const listener = {
      next: isConnected => {
        if (isConnected && hasConnectedOnce && !wasConnected) {
          window.location.reload();
        }
        if (isConnected) {
          hasConnectedOnce = true;
        }
        wasConnected = isConnected;
      },
    };
    cloud.connected.stream.addListener(listener);
    return () => cloud.connected.stream.removeListener(listener);
  }, [cloud]);
  return (
    <HostContextContainer {...HOST_CONFIG}>
      <App {...props} />
    </HostContextContainer>
  );
}

FullApp.router = App.router;
FullApp.navigationOptions = App.navigationOptions;

export default FullApp;
