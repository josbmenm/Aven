import React from 'react';
import { Text } from 'react-native';
import Button from './Button';
import KeyboardPopover from './KeyboardPopover';
import AppInfoText from './AppInfoText';
import { usePopover } from '../views/Popover';

import { Easing } from 'react-native-reanimated';
import { useNavigation } from '../navigation-hooks/Hooks';

import codePush from 'react-native-code-push';

export const AppEnvContext = React.createContext();

function BlitzDebug({ onClose }) {
  const { isSkynet, setIsSkynet } = React.useContext(AppEnvContext);
  const { navigate } = useNavigation();
  return (
    <React.Fragment>
      <AppInfoText />
      <Button
        onPress={() => {
          codePush.restartApp();
        }}
        title="Reload"
        secondary
      />
      <Text>Server: {isSkynet ? 'Skynet' : 'Verse'}</Text>
      <Button
        onPress={() => {
          setIsSkynet(!isSkynet);
        }}
        title={`Set to ${isSkynet ? 'Verse' : 'Skynet'}`}
        secondary
      />
      <Button
        onPress={() => {
          onClose();
          navigate('PaymentDebug');
        }}
        title={`Debug Card Reader`}
        type="outline"
      />
    </React.Fragment>
  );
}

export default function useBlitzDebugPopover() {
  const { onPopover } = usePopover(
    ({ onClose, ...props }) => {
      return (
        <KeyboardPopover onClose={onClose} {...props}>
          <BlitzDebug onClose={onClose} />
        </KeyboardPopover>
      );
    },
    { easing: Easing.linear, duration: 1 },
  );
  return { openPopover: onPopover };
}
