import React from 'react';
import { Text, View } from 'react-native';
import AsyncButton from './AsyncButton';
import { titleStyle } from './Styles';
import { useCardReaderConnectionManager } from '../card-reader/CardReader';
import { Spinner, Button } from '../dash-ui';

export const AppEnvContext = React.createContext();

export default function CardReaderConnectionManager({ onClose }) {
  const {
    persistedReaderSerialNumber,
    connectionStatus,
    managerConnectionStatus,
    readersAvailable,
    connectReader,
    discoverReaders,
    disconnectReader,
  } = useCardReaderConnectionManager();

  if (connectionStatus === 'connected') {
    return (
      <View style={{ padding: 12 }}>
        <Text style={{ ...titleStyle, fontSize: 20, marginBottom: 16 }}>
          Connected.{' '}
          {persistedReaderSerialNumber && ` (${persistedReaderSerialNumber})`}
        </Text>
        <Button
          title="disconnect"
          onPress={() => {
            disconnectReader();
          }}
        />
      </View>
    );
  }
  return (
    <View style={{ padding: 12 }}>
      <Text style={{ ...titleStyle, fontSize: 20, marginBottom: 16 }}>
        Disconnected.
      </Text>
      {readersAvailable &&
        managerConnectionStatus === 'scanning' &&
        readersAvailable.map(reader => (
          <AsyncButton
            style={{ marginBottom: 8 }}
            onPress={async () => {
              await connectReader(reader.serialNumber);
            }}
            title={`Connect ${reader.serialNumber}`}
          />
        ))}
      <View style={{ alignItems: 'center', height: 44 }}>
        {connectionStatus !== 'connected' && (
          <Spinner isSpinning={managerConnectionStatus === 'scanning'} />
        )}
      </View>
      {connectionStatus === 'disconnected' && (
        <Button
          title="connect now"
          onPress={() => {
            discoverReaders();
          }}
        />
      )}
      {persistedReaderSerialNumber && (
        <Button
          style={{ marginTop: 8 }}
          title={`forget ${persistedReaderSerialNumber}`}
          onPress={() => {
            disconnectReader();
          }}
        />
      )}
      <Button
        title="force restart app"
        onPress={() => {
          throw new Error('requested crash');
        }}
      />
      {/* <AsyncButton
        style={{ marginTop: 16 }}
        title="request location"
        onPress={async () => {
          const { status, permissions } = await Permissions.askAsync(
            Permissions.LOCATION,
          );
          alert(JSON.stringify({ status, permissions }));
        }}
      /> */}
      <Button title="done" onPress={onClose} />
    </View>
  );
}
