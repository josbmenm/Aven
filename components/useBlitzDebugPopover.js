import React from 'react';
import { Text, View, TouchableOpacity, Alert } from 'react-native';
import Button from './Button';
import AsyncButton from './AsyncButton';
import KeyboardPopover from './KeyboardPopover';
import { useAppInfoText } from './AppInfoText';
import { usePopover } from '../views/Popover';
import { titleStyle, primaryFontFace } from './Styles';
import { Easing } from 'react-native-reanimated';
import { useNavigation } from '../navigation-hooks/Hooks';
import codePush from 'react-native-code-push';
import { useCardReaderConnectionManager } from '../card-reader/CardReader';
import Spinner from './Spinner';
import useKeyboardPopover from './useKeyboardPopover';

export const AppEnvContext = React.createContext();

function ButtonRow({ children }) {
  return <View style={{ flexDirection: 'row' }}>{children}</View>;
}

function HiddenButton({ label, onPress }) {
  return (
    <TouchableOpacity style={{ flex: 1, padding: 8 }} onPress={onPress}>
      <Text
        style={{
          ...primaryFontFace,
          color: '#111',
          textAlign: 'center',
          fontSize: 18,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function CardReaderPopover({ onClose }) {
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
        style={{ marginTop: 32 }}
        title="force restart app"
        onPress={() => {
          throw new Error('requested crash');
        }}
      />
      {/* <Text>Persisted: {persistedReaderSerialNumber}</Text>
      <Text>Status: {connectionStatus}</Text>
      <Text>MgrStatus: {managerConnectionStatus}</Text>
      <Text>Readers: {JSON.stringify(readersAvailable)}</Text> */}
    </View>
  );
}

function BlitzDebug({ onClose, initialMode }) {
  const [debugMode, setDebugMode] = React.useState(initialMode);
  const { mode, deviceId } = React.useContext(AppEnvContext);
  const { navigate } = useNavigation();
  const [code, setCode] = React.useState('');
  function sendResetValue(char) {
    setCode(char);
  }
  function sendValue(char) {
    setCode(code + char);
  }
  const appInfoText = useAppInfoText();
  React.useEffect(() => {
    if (code === 'b12') {
      // ginger - greens - mango
      onClose();
      navigate('PaymentDebug');
    } else if (code === 'b13') {
      // ginger - greens - chia = card reader settings
      // onClose();
      setDebugMode('CardReader');
      // onCardReaderPopover();
    } else if (code === 'a45') {
      // coconut - banana - cashew = restart app
      codePush.restartApp();
    } else if (code === 'b5555') {
      // ginger - cashew - cashew - cashew - cashew
      throw new Error('User-requested crash');
    } else if (code === 'a03') {
      onClose();
      Alert.alert(
        'Insider stuff',
        `
${appInfoText}
Mode: ${mode}
Device id: ${deviceId}
`,
      );
    }
  }, [code, appInfoText]);
  if (debugMode === 'CardReader') {
    return <CardReaderPopover onClose={onClose} />;
  }
  return (
    <View style={{ padding: 30 }}>
      <Text style={{ ...titleStyle, fontSize: 22, marginBottom: 16 }}>
        ssh.. you found the secret buttons!
      </Text>
      <ButtonRow>
        <HiddenButton
          label="Coconut"
          onPress={() => {
            sendResetValue('a');
          }}
        />
        <HiddenButton
          label="Ginger"
          onPress={() => {
            sendResetValue('b');
          }}
        />
        <HiddenButton
          label="Coffee"
          onPress={() => {
            sendResetValue('c');
          }}
        />
      </ButtonRow>
      <ButtonRow>
        <HiddenButton
          label="Papaya"
          onPress={() => {
            sendValue('0');
          }}
        />
        <HiddenButton
          label="Greens"
          onPress={() => {
            sendValue('1');
          }}
        />
        <HiddenButton
          label="Mango"
          onPress={() => {
            sendValue('2');
          }}
        />
      </ButtonRow>
      <ButtonRow>
        <HiddenButton
          label="Chia"
          onPress={() => {
            sendValue('3');
          }}
        />
        <HiddenButton
          label="Banana"
          onPress={() => {
            sendValue('4');
          }}
        />
        <HiddenButton
          label="Cashew"
          onPress={() => {
            sendValue('5');
          }}
        />
      </ButtonRow>
    </View>
  );
}

export default function useBlitzDebugPopover(mode = 'switch') {
  const { onPopover } = useKeyboardPopover(({ onClose }) => {
    return <BlitzDebug onClose={onClose} initialMode={mode} />;
  });
  return { openPopover: onPopover };
}
