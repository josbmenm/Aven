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
  monsterra,
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
    <View style={{ marginBottom: 40 }}>
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
function TempCell({ title, value, button }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ ...titleStyle, color: monsterra, fontSize: 20 }}>
        {title}
      </Text>
      <Text style={{ ...proseFontFace, color: monsterra, fontSize: 62 }}>
        {value}
      </Text>
      {button}
    </View>
  );
}
function TemperatureView() {
  return (
    <StatusSection title="Food Safety">
      <View style={{ flexDirection: 'row' }}>
        <TempCell
          title="Frozen Food"
          value="0°F"
          button={
            <Button
              title="clear alarm. frozen food is fresh."
              onPress={() => {}}
              disabled
            />
          }
        />
        <TempCell
          title="Piston Fridge"
          value="42°F"
          button={
            <Button
              title="clear alarm. cold piston filler is fresh."
              onPress={() => {}}
              disabled
            />
          }
        />
      </View>
      <View style={{ flexDirection: 'row' }}>
        <TempCell
          title="Beverage Fridge"
          value="42°F"
          button={
            <Button
              title="clear alarm. beverages are fresh."
              onPress={() => {}}
              disabled
            />
          }
        />
        <TempCell title="Warm Truck" value="80°F" button={null} />
      </View>
    </StatusSection>
  );
}

function AirPressureView() {
  return (
    <StatusSection title="Air Pressure">
      <Tag title="Pressurized" color={Tag.positiveColor} />
      <Button title="Disable and Depressureize" onPress={() => {}} />
      <Button title="Enable" disabled onPress={() => {}} />
    </StatusSection>
  );
}

function PowerView() {
  return (
    <StatusSection title="Generator Power">
      <Tag title="Disabled" color={Tag.negativeColor} />
      <Button title="Enable" onPress={() => {}} />
    </StatusSection>
  );
}

function SkidView() {
  return (
    <StatusSection title="Machine Loading">
      <Tag title="Locked" color={Tag.positiveColor} />
      <Button title="Unlock Skid" onPress={() => {}} />
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
        <SkidView />
      </RootAuthenticationSection>
    </SimplePage>
  );
}

RestaurantStatusScreen.navigationOptions = SimplePage.navigationOptions;
