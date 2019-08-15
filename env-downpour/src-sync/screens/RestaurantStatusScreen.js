import React from 'react';
import RootAuthenticationSection from './RootAuthenticationSection';
import { Text, View } from 'react-native';
import SimplePage from '../components/SimplePage';
import { useCloud } from '../cloud-core/KiteReact';
import Row from '../components/Row';
import Tag from '../components/Tag';
import Button from '../components/Button';
import useAsyncError from '../react-utils/useAsyncError';
import { Easing } from 'react-native-reanimated';
import {
  titleStyle,
  proseFontFace,
  monsterra,
  standardTextColor,
} from '../components/Styles';
import KeyboardPopover from '../components/KeyboardPopover';
import { usePopover } from '../views/Popover';
import { useRestaurantState, useIsRestaurantOpen } from '../ono-cloud/Kitchen';
import useTimeSeconds from '../utils/useTimeSeconds';
import RowSection from '../components/RowSection';
import Subtitle from '../components/Subtitle';
import MultiSelect from '../components/MultiSelect';
import { useKitchenState } from '../ono-cloud/OnoKitchen';

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
  const [restaurantState, dispatch] = useRestaurantState();

  return (
    <View>
      <PopoverTitle>Close Restaurant..</PopoverTitle>
      <Button
        title="gracefully, in 10 minutes"
        onPress={() => {
          dispatch({
            type: 'ScheduleRestaurantClose',
            scheduledCloseTime: Date.now() + 1000 * 60 * 10,
          });
          onClose();
        }}
      />
      <Button
        title="now. finish queued orders"
        onPress={() => {
          dispatch({
            type: 'CloseRestaurant',
            immediate: false,
          });
          onClose();
        }}
      />
      <Button
        title="immediately. cancel queued orders"
        onPress={() => {
          dispatch({
            type: 'CloseRestaurant',
            immediate: true,
          });
          onClose();
        }}
      />
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

function ButtonStack({ buttons }) {
  return (
    <View>
      {buttons.map((button, buttonIndex) => (
        <View
          style={{ marginBottom: buttonIndex === buttons.length - 1 ? 0 : 12 }}
        >
          {button}
        </View>
      ))}
    </View>
  );
}

function StatusView() {
  const [restaurantState, dispatch] = useRestaurantState();
  const { isOpen, closingSoon } = useIsRestaurantOpen(restaurantState);
  const timeSeconds = useTimeSeconds();
  let tagText = 'restaurant open';
  if (closingSoon) {
    const totalSecRemaining = Math.floor(
      closingSoon.scheduledCloseTime / 1000 - timeSeconds,
    );
    const minsRemaining = Math.floor(totalSecRemaining / 60);
    const minSecRemaining = totalSecRemaining % 60;
    tagText = `restaurant closing in \n${minsRemaining}:${String(
      minSecRemaining,
    ).padStart(2, '0')}`;
  }
  if (!isOpen) {
    tagText = 'restaurant closed';
  }

  const { onPopover: onCloseRestaurantPopover } = usePopover(
    ({ onClose, ...props }) => {
      return (
        <KeyboardPopover onClose={onClose} {...props}>
          <CloseRestaurantButtons onClose={onClose} />
        </KeyboardPopover>
      );
    },
    { easing: Easing.linear, duration: 1 },
  );
  return (
    <RowSection>
      <Row title="restaurant status">
        <View style={{ flex: 1 }}>
          <Subtitle title={tagText} />
        </View>
        <ButtonStack
          buttons={[
            isOpen ? (
              <Button
                title="close restaurant"
                onPress={onCloseRestaurantPopover}
              />
            ) : (
              <Button
                title="open restaurant"
                onPress={() => {
                  dispatch({
                    type: 'OpenRestaurant',
                  });
                }}
              />
            ),
            closingSoon && (
              <Button
                title="clear close schedule"
                type="outline"
                onPress={() => {
                  dispatch({
                    type: 'ScheduleRestaurantClose',
                    scheduledCloseTime: null,
                  });
                }}
              />
            ),
          ]}
        />
      </Row>
    </RowSection>
  );
}

function AirPressureView() {
  return (
    <RowSection title="Air Pressure">
      <Tag title="Pressurized" color={Tag.positiveColor} />
      <Button title="Disable and Depressureize" onPress={() => {}} />
      <Button title="Enable" disabled onPress={() => {}} />
    </RowSection>
  );
}

function PowerView() {
  return (
    <RowSection title="Generator Power">
      <Tag title="Disabled" color={Tag.negativeColor} />
      <Button title="Enable" onPress={() => {}} />
    </RowSection>
  );
}

function SkidView() {
  return (
    <RowSection title="Machine Loading">
      <Tag title="Locked" color={Tag.positiveColor} />
      <Button title="Unlock Skid" onPress={() => {}} />
    </RowSection>
  );
}

function FridgeView() {
  const kitchenState = useKitchenState();
  const fridgeEnabled =
    !!kitchenState && !!kitchenState.System_EnableRefrigerationSystem_VALUE;
  const cloud = useCloud();
  const handleError = useAsyncError();
  return (
    <Row title="Main Refridgeration">
      <Tag
        title={fridgeEnabled ? 'Enabled' : 'Disabled'}
        color={fridgeEnabled ? Tag.positiveColor : Tag.negativeColor}
      />
      <MultiSelect
        options={[
          { name: 'Enable', value: true },
          { name: 'Disable', value: false },
        ]}
        value={fridgeEnabled}
        onValue={value => {
          handleError(
            cloud.dispatch({
              type: 'KitchenWriteMachineValues',
              subsystem: 'System',
              pulse: [],
              values: {
                EnableRefrigerationSystem: value,
              },
            }),
          );
        }}
      />
    </Row>
  );
}

export default function RestaurantStatusScreen(props) {
  return (
    <SimplePage {...props} hideBackButton>
      <RootAuthenticationSection>
        <StatusView />
        <FridgeView />
        {/* <AirPressureView />
        <PowerView />
        <SkidView /> */}
      </RootAuthenticationSection>
    </SimplePage>
  );
}

RestaurantStatusScreen.navigationOptions = SimplePage.navigationOptions;
