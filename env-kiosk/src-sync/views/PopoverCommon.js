import React, { useContext, useState } from 'react';
import { View, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { useNavigation } from '../navigation-hooks/Hooks';
import NavigationContext from '../navigation-core/views/NavigationContext';

export const PopoverContext = React.createContext(null);

export function PopoverTarget({ renderContent, renderPopover, timing }) {
  const ctx = useContext(PopoverContext);
  async function onPopover() {
    const location = await new Promise(resolve =>
      viewRef.current.measure((x, y, width, height, pageX, pageY) => {
        resolve({ x, y, width, height, pageX, pageY });
      })
    );
    ctx.openPopover(renderPopover(), location, timing);
  }
  const viewRef = React.createRef();
  return <View ref={viewRef}>{renderContent(onPopover)}</View>;
}

export function useTargetPopover(renderPopover, timing) {
  const ctx = useContext(PopoverContext);
  const navigation = useNavigation();
  const targetRef = React.createRef();
  async function onPopover() {
    const location = await new Promise(resolve =>
      targetRef.current.measure((x, y, width, height, pageX, pageY) => {
        resolve({ x, y, width, height, pageX, pageY });
      })
    );
    ctx.openPopover(renderPopover, location, timing, navigation);
  }
  return { targetRef, onPopover };
}

export function usePopover(renderPopover, timing) {
  const ctx = useContext(PopoverContext);
  const navigation = useNavigation();
  async function onPopover() {
    ctx.openPopover(renderPopover, null, timing, navigation);
  }
  return { onPopover };
}
