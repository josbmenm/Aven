import React from 'react';
import { usePopover } from '../views/Popover';
import { Easing } from 'react-native-reanimated';
import KeyboardPopover from '../components/KeyboardPopover';

export default function useKeyboardPopover(onRenderContent) {
  return usePopover(
    props => {
      return (
        <KeyboardPopover {...props}>{onRenderContent(props)}</KeyboardPopover>
      );
    },
    { easing: Easing.linear, duration: 3000 },
  );
}
