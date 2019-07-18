import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableHighlight,
  Alert,
  ScrollView,
  AlertIOS,
} from 'react-native';
import { Easing } from 'react-native-reanimated';
import Button from '../components/Button';
import RootAuthenticationSection from './RootAuthenticationSection';
import {
  CardReaderLog,
  useCardReader,
  useCardPaymentCapture,
  useCardReaderConnectionManager,
  disconnectReader,
  clearReaderLog,
} from '../card-reader/CardReader';
import RowSection from '../components/RowSection';
import TextRow from '../components/TextRow';
import SimplePage from '../components/SimplePage';
import Row from '../components/Row';
import Spinner from '../components/Spinner';
import BitRow from '../components/BitRow';
import { rowStyle, rowTitleStyle, titleStyle } from '../components/Styles';
import {
  useCloudReducer,
  useCloud,
  useCloudValue,
} from '../cloud-core/KiteReact';
import DevicesReducer from '../logic/DevicesReducer';
import BlockForm from '../components/BlockForm';
import Title from '../components/Title';
import BlockFormButton from '../components/BlockFormButton';
import BlockFormMessage from '../components/BlockFormMessage';
import BlockFormInput from '../components/BlockFormInput';
import KeyboardPopover from '../components/KeyboardPopover';
import { usePopover } from '../views/Popover';
import useAsyncError from '../react-utils/useAsyncError';

function ModeForm({ onClose, deviceDoc }) {
  const deviceState = useCloudValue(deviceDoc);
  const handleErrors = useAsyncError();

  function getModeSetter(mode) {
    return () => {
      handleErrors(
        deviceDoc
          .putValue({
            ...(deviceState || {}),
            mode,
          })
          .then(onClose),
      );
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
  const deviceDoc = cloud.get(`@${device.deviceId}/ScreenControl`);
  const dispatch = cloud.get('DeviceActions').putTransaction;
  const deviceState = useCloudValue(deviceDoc);
  const handleErrors = useAsyncError();

  const { onPopover } = usePopover(
    ({ onClose, popoverOpenValue }) => {
      return (
        <KeyboardPopover onClose={onClose}>
          <ModeForm onClose={onClose} deviceDoc={deviceDoc} />
        </KeyboardPopover>
      );
    },
    { easing: Easing.linear, duration: 1 },
  );

  return (
    <Row
      title={
        deviceState == undefined
          ? 'Loading..'
          : (deviceState && deviceState.name) || 'Unnamed'
      }
    >
      <View style={{ flexDirection: 'row' }}>
        <Button
          title={
            deviceState && deviceState.mode
              ? `Mode: ${deviceState.mode}`
              : 'Mode'
          }
          onPress={onPopover}
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
          onPress={() => {
            AlertIOS.prompt('New Device Name', null, name => {
              handleErrors(
                deviceDoc.docValue({
                  ...(deviceState || {}),
                  name,
                }),
              );
            });
          }}
        />
      </View>
    </Row>
  );
}

function DeviceManager() {
  const [devicesState, dispatch] = useCloudReducer(
    'DeviceActions',
    DevicesReducer,
  );
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
