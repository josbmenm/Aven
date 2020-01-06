import React from 'react';
import { View, AlertIOS } from 'react-native';
import { Easing } from 'react-native-reanimated';
import { Button } from '../dash-ui';
import RootAuthenticationSection from './RootAuthenticationSection';
import RowSection from '../components/RowSection';
import TextRow from '../components/TextRow';
import BlockFormInput from '../components/BlockFormInput';
import SimplePage from '../components/SimplePage';
import Row from '../components/Row';
import { Spinner } from '../dash-ui';
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

function SetMDMIdForm({ onClose, device, dispatch }) {
  const [mdmId, setMdmId] = React.useState(device.mdmId);
  const handleErrors = useAsyncError();
  async function saveId(mdmId) {
    await dispatch({
      type: 'SetDevice',
      deviceId: device.deviceId,
      mdmId,
    });
    onClose();
  }
  function handleSubmit() {
    handleErrors(saveId(mdmId));
  }
  const { inputs } = useFocus({
    onSubmit: handleSubmit,
    inputRenderers: [
      props => (
        <BlockFormInput
          {...props}
          label="mdm id"
          value={mdmId}
          onValue={setMdmId}
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

function RestartButton({ mdmId }) {
  const cloud = useCloud();
  return (
    <Button
      title="Restart"
      secondary
      onPress={() => {
        cloud.dispatch({
          type: 'RestartDevice',
          mdmId,
        });
      }}
    />
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
      <Button title="Feedback" onPress={getModeSetter('feedback')} />
    </React.Fragment>
  );
}

function DeviceRow({ device }) {
  const cloud = useCloud();
  const dispatch = cloud.get('DeviceActions').putTransactionValue;
  const handleErrors = useAsyncError();

  const { onPopover: onMdmIdPopover } = useKeyboardPopover(({ onClose }) => (
    <SetMDMIdForm onClose={onClose} device={device} dispatch={dispatch} />
  ));

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

        <Button
          title="Rename"
          secondary
          onPress={onRenamePopover}
          onLongPress={onMdmIdPopover}
        />

        {device.mdmId && <RestartButton mdmId={device.mdmId} />}
      </View>
    </Row>
  );
}

function DeviceManager() {
  const devicesState = useCloudValue('DevicesState');
  if (!devicesState) {
    return (
      <View style={{ alignItems: 'center', marginTop: 100 }}>
        <Spinner />
      </View>
    );
  }
  const devices = devicesState.devices || [];
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
