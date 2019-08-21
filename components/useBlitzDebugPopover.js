import React from 'react';
import { Text } from 'react-native';
import Button from './Button';
import KeyboardPopover from './KeyboardPopover';
import AppInfoText from './AppInfoText';
import { usePopover } from '../views/Popover';
import { titleStyle, primaryFontFace } from './Styles';

import { Easing } from 'react-native-reanimated';
import { useNavigation } from '../navigation-hooks/Hooks';

import codePush from 'react-native-code-push';

export const AppEnvContext = React.createContext();

function BlitzDebug({ onClose }) {
  const { mode, deviceId } = React.useContext(AppEnvContext);
  const { navigate } = useNavigation();
  return (
    <React.Fragment>
      <Text style={{ ...titleStyle }}>Secret Buttons</Text>
      <Text style={{ ...primaryFontFace }}>Mode: {mode}</Text>
      <Text style={{ ...primaryFontFace }}>Device Id: {deviceId}</Text>
      <AppInfoText />
      <Button
        onPress={() => {
          codePush.restartApp();
        }}
        title="Reload"
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
