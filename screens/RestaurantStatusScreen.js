import React from 'react';
import RootAuthenticationSection from './RootAuthenticationSection';
import { Text, View } from 'react-native';
import SimplePage from '../components/SimplePage';
import Tag from '../components/Tag';
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

function StatusSection({ title, children }) {
  return (
    <View style={{}}>
      <Text style={{ ...titleStyle, fontSize: 24 }}>{title}</Text>
      {children}
    </View>
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
    <StatusSection title="Status Display & Kiosks">
      <Button title="Open Restaurant" onPress={() => {}} />
      <Button title="Close Restaurant" onPress={onCloseRestaurantPopover} />
    </StatusSection>
  );
}

function TemperatureView() {
  return (
    <StatusSection title="Temperature">
      <Button
        title="clear alarm. frozen food is fresh."
        onPress={() => {}}
        disabled
      />
      <Button
        title="clear alarm. cold piston filler is fresh."
        onPress={() => {}}
        disabled
      />
      <Button
        title="clear alarm. beverages are fresh."
        onPress={() => {}}
        disabled
      />
    </StatusSection>
  );
}

function AirPressureView() {
  return (
    <StatusSection title="Air Pressure">
      <Tag title="Pressurized" />
      <Button title="Close Restaurant" onPress={() => {}} />
    </StatusSection>
  );
}

function PowerView() {
  return (
    <StatusSection title="Generator Power">
      <Tag title="Disabled" />
      <Button title="Enable" onPress={() => {}} />
    </StatusSection>
  );
}

export default function RestaurantStatusScreen(props) {
  return (
    <SimplePage title="Restaurant Status" icon="🚐" {...props}>
      <RootAuthenticationSection>
        <StatusView />
        <TemperatureView />
        <AirPressureView />
        <PowerView />
      </RootAuthenticationSection>
    </SimplePage>
  );
}

RestaurantStatusScreen.navigationOptions = SimplePage.navigationOptions;
