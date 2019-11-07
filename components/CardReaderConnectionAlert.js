import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import useBlitzDebugPopover from '../components/useBlitzDebugPopover';
import { useCardReaderConnectionManager } from '../card-reader/CardReader';

export default function CardReaderConnectionAlert({ tintColor }) {
  const { openPopover } = useBlitzDebugPopover('CardReader');
  const {
    connectionStatus,
    persistedReaderSerialNumber,
  } = useCardReaderConnectionManager();
  const isConnected =
    connectionStatus === 'connected' && persistedReaderSerialNumber;
  if (isConnected) {
    return null;
  }
  return (
    <TouchableOpacity
      style={{
        width: 44,
        height: 44,
        position: 'absolute',
        left: 20,
        bottom: 20,
      }}
      onLongPress={() => {
        openPopover();
      }}
    >
      <Image
        style={{
          width: 44,
          height: 44,
          tintColor,
        }}
        source={require('../components/assets/Negative.png')}
      />
    </TouchableOpacity>
  );
}
