import React from 'react';
import { Text, View, TouchableOpacity, Alert } from 'react-native';
import Button from './Button';
import KeyboardPopover from './KeyboardPopover';
import { useAppInfoText } from './AppInfoText';
import { usePopover } from '../views/Popover';
import { titleStyle, primaryFontFace } from './Styles';

import { Easing } from 'react-native-reanimated';
import { useNavigation } from '../navigation-hooks/Hooks';

import codePush from 'react-native-code-push';
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
  return <View style={{ padding: 8 }}></View>;
}

function useCardReaderPopover() {
  const { onPopover } = useKeyboardPopover(({ onClose }) => (
    <CardReaderPopover onClose={onClose} />
  ));
  return onPopover;
}
function BlitzDebug({ onClose }) {
  const { mode, deviceId } = React.useContext(AppEnvContext);
  const { navigate } = useNavigation();
  const [code, setCode] = React.useState('');
  const onCardReaderPopover = useCardReaderPopover();
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
      onClose();
      onCardReaderPopover();
    } else if (code === 'a45') {
      // coconut - banana - cashew = restart app
      codePush.restartApp();
    } else if (code === 'b5555') {
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
