import React from 'react';
import { Text, View } from 'react-native';
import { prettyShadow, titleStyle, standardTextColor } from './Styles';
import TagButton from './TagButton';
import Button from './Button';
import { Easing } from 'react-native-reanimated';
import { usePopover } from '../views/Popover';
import KeyboardPopover from './KeyboardPopover';
import { useRestaurantState } from '../ono-cloud/Kitchen';

function AlarmButton({ alarm, onReset }) {
  const { onPopover } = usePopover(
    ({ onClose, ...props }) => {
      return (
        <KeyboardPopover onClose={onClose} {...props}>
          <View style={{ flex: 1, padding: 10 }}>
            <Text
              style={{
                ...titleStyle,
                fontSize: 16,
                color: standardTextColor,
              }}
            >
              {alarm.description}
            </Text>
          </View>
          <View style={{ padding: 10 }}>
            <Button
              onPress={() => {
                onReset();
                onClose();
              }}
              title="reset alarm"
            />
          </View>
        </KeyboardPopover>
      );
    },
    { easing: Easing.linear, duration: 100 },
  );
  return (
    <TagButton
      title={alarm.title}
      color={TagButton.negativeColor}
      onPress={onPopover}
      style={{ marginHorizontal: 5 }}
    />
  );
}

export default function StatusBar() {
  const [restaurantState, dispatch] = useRestaurantState();

  if (!restaurantState) {
    return null;
  }
  const alarms = restaurantState.alarms || [];

  return (
    <View
      style={{
        borderRadius: 4,
        backgroundColor: 'white',
        padding: 7,
        paddingHorizontal: 14,
        height: 60,
        flexDirection: 'row',
        ...prettyShadow,
      }}
    >
      {alarms.map(alarm => {
        const type = alarm.alarmType;
        let alarmData = {
          title: 'Unknown',
          description: `Unidentified alarm - ${JSON.stringify(alarm)}`,
        };
        if (type === 'FreezerTemp') {
          alarmData = {
            title: 'Freezer Temperature',
            // description: `Freezer has gone above 5°F`,
            description: `Freezer has gone above 65°F`,
          };
        } else if (type === 'BevTemp') {
          alarmData = {
            title: 'Beverage Temperature',
            description: `Beverage fridge has gone above 41°F`,
          };
        } else if (type === 'YogurtTemp') {
          alarmData = {
            title: 'Yogurt Temperature',
            description: `Yogurt fridge has gone above 89°F`,
          };
        } else if (type === 'WasteFull') {
          alarmData = {
            title: 'Waste Full',
            description: `Liquid waste tank is full`,
          };
        } else if (type === 'WaterEmpty') {
          alarmData = {
            title: 'Water Empty',
            description: `Fresh water tank is low or empty.`,
          };
        }
        return (
          <AlarmButton
            alarm={alarmData}
            onReset={() => {
              dispatch({
                type: 'ClearAlarm',
                key: alarm.key,
              });
            }}
          />
        );
      })}
    </View>
  );
}
