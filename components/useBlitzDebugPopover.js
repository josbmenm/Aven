import React from 'react';
import Button from './Button';
import KeyboardPopover from './KeyboardPopover';
import AppInfoText from './AppInfoText';
import { usePopover } from '../views/Popover';

import { Easing } from 'react-native-reanimated';

import codePush from 'react-native-code-push';

function BlitzDebug() {
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
    </React.Fragment>
  );
}

export default function useBlitzDebugPopover() {
  const { onPopover } = usePopover(
    ({ onClose, popoverOpenValue }) => {
      return (
        <KeyboardPopover onClose={onClose}>
          <BlitzDebug onClose={onClose} />
        </KeyboardPopover>
      );
    },
    { easing: Easing.linear, duration: 1 },
  );
  return { openPopover: onPopover };
}
