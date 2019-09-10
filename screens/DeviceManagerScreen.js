import React from 'react';
import { View, AlertIOS } from 'react-native';
import { Easing } from 'react-native-reanimated';
import Button from '../components/Button';
import RootAuthenticationSection from './RootAuthenticationSection';
import RowSection from '../components/RowSection';
import TextRow from '../components/TextRow';
import BlockFormInput from '../components/BlockFormInput';
import SimplePage from '../components/SimplePage';
import Row from '../components/Row';
import Spinner from '../components/Spinner';
import { useCloud, useCloudValue } from '../cloud-core/KiteReact';
import useKeyboardPopover from '../components/useKeyboardPopover';
import useAsyncError from '../react-utils/useAsyncError';
import useFocus from '../navigation-hooks/useFocus';

function RenameForm({ onClose, device, dispatch }) {
  const [name, setName] = React.useState(device.name);
  const handleErrors = useAsyncError();
  async function saveName(name) {
    await dispatch({
      type: 'SetDevice',
      deviceId: device.deviceId,
      name,
    });
    onClose();
  }
  function handleSubmit() {
    handleErrors(saveName(name));
  }
  const { inputs } = useFocus({
    onSubmit: handleSubmit,
    inputRenderers: [
      props => (
        <BlockFormInput
          {...props}
          label="name"
          value={name}
          onValue={setName}
        />
      ),
    ],
  });

  return (
    <View>
      <View style={{ flexDirection: 'row' }}>{inputs}</View>
      <Button title="save" onPress={handleSubmit} />
    </View>
  );
}

function ModeForm({ onClose, device, dispatch }) {
  const handleErrors = useAsyncError();
  async function setMode(mode) {
    await dispatch({
      type: 'SetDevice',
      deviceId: device.deviceId,
      mode,
    });
    onClose();
  }
  function getModeSetter(mode) {
    return () => {
      handleErrors(setMode(mode));
    };
  }
  return (
    <React.Fragment>
      <Button title="Closed" onPress={getModeSetter('closed')} />
      <Button title="Kiosk" onPress={getModeSetter('kiosk')} />
      <Button title="Kiosk (Skynet)" onPress={getModeSetter('testKiosk')} />
      <Button title="Feedback" onPress={getModeSetter('feedback')} />
      <Button title="Card Reader" onPress={getModeSetter('cardreader')} />
    </React.Fragment>
  );
}

function DeviceRow({ device }) {
  const cloud = useCloud();
  const dispatch = cloud.get('DeviceActions2').putTransactionValue;
  const handleErrors = useAsyncError();

  const { onPopover: onRenamePopover } = useKeyboardPopover(({ onClose }) => (
    <RenameForm onClose={onClose} device={device} dispatch={dispatch} />
  ));

  const { onPopover: onModePopover } = useKeyboardPopover(
    ({ onClose }) => {
      return <ModeForm onClose={onClose} device={device} dispatch={dispatch} />;
    },
    { easing: Easing.linear, duration: 1 },
  );

  return (
    <Row
      title={
        device == undefined ? 'Loading..' : (device && device.name) || 'Unnamed'
      }
    >
      <View style={{ flexDirection: 'row' }}>
        <Button
          title={device && device.mode ? `Mode: ${device.mode}` : 'Mode'}
          onPress={onModePopover}
        />
        <Button
          title="Forget"
          secondary
          onPress={() => {
            handleErrors(
              dispatch({
                type: 'ForgetDevice',
                deviceId: device.deviceId,
              }),
            );
          }}
        />

        <Button title="Rename" secondary onPress={onRenamePopover} />
      </View>
    </Row>
  );
}

function DeviceManager() {
  const devicesState = useCloudValue('DevicesState');
  const devices = (devicesState && devicesState.devices) || [];
  if (!devices) {
    return <Spinner />;
  }
  if (devices.length === 0) {
    return (
      <RowSection>
        <TextRow text="No Devices Yet" />
      </RowSection>
    );
  }
  return (
    <RowSection>
      {devices.map(device => (
        <DeviceRow device={device} key={device.deviceId} />
      ))}
    </RowSection>
  );
}

export default function DeviceManagerScreen(props) {
  return (
    <SimplePage title="Device Manager" icon="📱" {...props}>
      <RootAuthenticationSection>
        <DeviceManager />
      </RootAuthenticationSection>
    </SimplePage>
  );
}

DeviceManagerScreen.navigationOptions = SimplePage.navigationOptions;
