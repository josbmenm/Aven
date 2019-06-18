import React from 'react';
import RootAuthenticationSection from './RootAuthenticationSection';
import { Text, View } from 'react-native';
import SimplePage from '../components/SimplePage';
import Button from '../components/Button';
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

function CloseRestaurantButtons({ onClose }) {
  return (
    <View>
      <PopoverTitle>Close Restaurant..</PopoverTitle>
      <Button title="gracefully, in 10 minutes" onPress={() => {}} />
      <Button title="now. finish queued orders" onPress={() => {}} />
      <Button title="immediately. cancel queued orders" onPress={() => {}} />
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
    ({ onClose, popoverOpenValue }) => {
      return (
        <KeyboardPopover onClose={onClose}>
          <CloseRestaurantButtons onClose={onClose} />
        </KeyboardPopover>
      );
    },
    { easing: Easing.linear, duration: 1 },
  );

  return (
    <React.Fragment>
      <Button title="Open Restaurant" onPress={() => {}} />
      <Button title="Close Restaurant" onPress={onCloseRestaurantPopover} />
    </React.Fragment>
  );
}

export default function RestaurantStatusScreen(props) {
  return (
    <SimplePage title="Restaurant Status" icon="🚐" {...props}>
      <RootAuthenticationSection>
        <StatusView />
      </RootAuthenticationSection>
    </SimplePage>
  );
}

RestaurantStatusScreen.navigationOptions = SimplePage.navigationOptions;
