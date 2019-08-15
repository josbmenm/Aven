import React from 'react';
import RootAuthenticationSection from './RootAuthenticationSection';
import { Text, View } from 'react-native';
import SimplePage from '../components/SimplePage';
import Button from '../components/Button';
import TemperatureView from '../components/TemperatureView';
import { Easing } from 'react-native-reanimated';
import {
  titleStyle,
  proseFontFace,
  standardTextColor,
} from '../components/Styles';
import KeyboardPopover from '../components/KeyboardPopover';
import { usePopover } from '../views/Popover';

function PopoverTitle({ children }) {
  return (
    <Text
      style={{
        ...titleStyle,
        textAlign: 'center',
        margin: 8,
        fontSize: 28,
      }}
    >
      {children}
    </Text>
  );
}

function ClearAlarmsPopover({ onClose }) {
  return (
    <View>
      <PopoverTitle>Clear Alarms coming soon..</PopoverTitle>
    </View>
  );
}

function InfoText({ children }) {
  return (
    <Text style={{ ...proseFontFace, color: standardTextColor }}>
      {children}
    </Text>
  );
}
function StatusView() {
  const { onPopover: onCloseRestaurantPopover } = usePopover(
    ({ onClose, ...props }) => {
      return (
        <KeyboardPopover onClose={onClose} {...props}>
          <ClearAlarmsPopover onClose={onClose} />
        </KeyboardPopover>
      );
    },
    { easing: Easing.linear, duration: 1 },
  );

  return (
    <React.Fragment>
      <Button title="Clear Alarms" onPress={onCloseRestaurantPopover} />
    </React.Fragment>
  );
}

export default function AlarmsScreen(props) {
  return (
    <SimplePage hideBackButton {...props}>
      <RootAuthenticationSection>
        <TemperatureView />
        {/* <StatusView /> */}
      </RootAuthenticationSection>
    </SimplePage>
  );
}

AlarmsScreen.navigationOptions = SimplePage.navigationOptions;
