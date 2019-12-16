import React from 'react';
import { Text, View, Image } from 'react-native';
import {
  prettyShadow,
  titleStyle,
  standardTextColor,
  primaryFontFace,
} from './Styles';
import TagButton from './TagButton';
import Button from './Button';
import { useInStockInventoryMenu } from '../ono-cloud/OnoKitchen';
import { Easing } from 'react-native-reanimated';
import { usePopover } from '../views/Popover';
import KeyboardPopover from './KeyboardPopover';
import { useRestaurantState } from '../ono-cloud/Kitchen';
import useKitchenStatus from '../components/useKitchenStatus';
import Tag from './Tag';
import Spinner from './Spinner';
import AsyncButton from './AsyncButton';
import { useCloud } from '../cloud-core/KiteReact';
import { getCupsInventoryState } from '../logic/KitchenState';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '../navigation-hooks/Hooks';

function FaultButton({ fault, isWarningColor, onReset }) {
  const { onPopover } = usePopover(
    ({ onClose, ...props }) => {
      return (
        <KeyboardPopover onClose={onClose} {...props}>
          <View style={{ padding: 10, width: 320 }}>
            <Text style={{ ...titleStyle, fontSize: 18 }}>{fault.title}</Text>
            <View
              style={{
                flexDirection: 'column',
              }}
            >
              <Text
                style={{
                  ...primaryFontFace,
                  fontSize: 16,
                  color: standardTextColor,
                }}
              >
                {fault.description}
              </Text>
            </View>
          </View>
          {onReset && (
            <View style={{ padding: 10, paddingBottom: 0, paddingTop: 32 }}>
              <Button
                onPress={() => {
                  onReset();
                  onClose();
                }}
                title="reset"
              />
            </View>
          )}
          <View style={{ padding: 10 }}>
            <Button
              type="outline"
              onPress={() => {
                onClose();
              }}
              title="ok"
            />
          </View>
        </KeyboardPopover>
      );
    },
    { easing: Easing.linear, duration: 100 },
  );
  return (
    <TagButton
      title={fault.title}
      status={isWarningColor ? 'warning' : 'negative'}
      onPress={onPopover}
      style={{ marginHorizontal: 5 }}
    />
  );
}

export default function StatusBar() {
  const cloud = useCloud();
  const { navigate } = useNavigation();
  const [restaurantState, dispatch] = useRestaurantState();
  const menu = useInStockInventoryMenu();
  const inStockCount = (menu && menu.blends && menu.blends.length) || 0;

  const { status, message, isRunning, kitchenState } = useKitchenStatus(
    restaurantState,
  );
  let areCupsEmpty = false;
  let areCupsLow = false;
  if (kitchenState) {
    const { estimatedRemaining, isEmpty } = getCupsInventoryState(kitchenState);
    areCupsLow =
      typeof estimatedRemaining === 'number' && estimatedRemaining <= 10;
    areCupsEmpty = isEmpty;
  }
  if (!restaurantState) {
    return null;
  }
  const restaurantFaults = restaurantState.restaurantFaults || [];

  return (
    <View
      style={{
        borderRadius: 4,
        backgroundColor: 'white',
        paddingRight: 14,
        height: 60,
        flexDirection: 'row',
        justifyContent: 'space-between',
        ...prettyShadow,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
        }}
      >
        <TouchableOpacity
          onPress={() => {
            navigate('Sequencer');
          }}
          style={{ margin: 7 }}
        >
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              marginRight: 8,
              paddingTop: 7,
              paddingLeft: 7,
              backgroundColor:
                status === 'ready'
                  ? Tag.positiveColor
                  : status === 'paused'
                  ? Tag.warningColor
                  : Tag.negativeColor,
            }}
          >
            {isRunning && <Spinner color="white" />}
          </View>
        </TouchableOpacity>
        <View style={{ padding: 8, flexDirection: 'row' }}>
          {status !== 'paused' && status !== 'ready' && !isRunning && (
            <FaultButton
              fault={{
                title: message,
                status,
              }}
            />
          )}
          {(areCupsEmpty || areCupsLow) && (
            <FaultButton
              fault={{ title: 'Cups Low' }}
              isWarningColor={!areCupsEmpty}
            />
          )}
          {inStockCount < 3 && (
            <FaultButton
              fault={{ title: `${inStockCount} blends in stock` }}
              isWarningColor={inStockCount > 1}
            />
          )}
          {restaurantFaults.map(fault => {
            const type = fault.restaurantFaultType;
            let faultData = {
              title: 'Unknown',
              description: `Unidentified fault - ${JSON.stringify(fault)}`,
            };
            if (type === 'FreezerTemp') {
              faultData = {
                title: 'Freezer Temperature',
                description: `Freezer has gone above 5°F. Press "reset" once freezer is cleaned and food is replaced, then press start.`,
              };
            } else if (type === 'BevTemp') {
              faultData = {
                title: 'Beverage Temperature',
                description: `Beverage fridge has gone above 41°F. Press "reset" once the beverage fridge is cleaned and food is replaced, then press start.`,
              };
            } else if (type === 'PistonTemp') {
              faultData = {
                title: 'Piston Temperature',
                description: `Piston fridge has gone above 41°F. Press "reset" once the piston fridge is cleaned and food is replaced, then press start.`,
              };
            } else if (type === 'WasteFull') {
              faultData = {
                title: 'Waste Full',
                description: `Liquid waste tank is full`,
              };
            } else if (type === 'WaterEmpty') {
              faultData = {
                title: 'Water Empty',
                description: `Fresh water tank is low or empty.`,
              };
            }
            return (
              <FaultButton
                key={fault.key}
                fault={faultData}
                onReset={
                  fault.ackTime === 0 &&
                  (() => {
                    dispatch({
                      type: 'AckFault',
                      key: fault.key,
                    });
                  })
                }
              />
            );
          })}
        </View>
      </View>
      <View style={{ padding: 8 }}>
        {status === 'paused' && (
          <Button
            title="start"
            onPress={() => {
              dispatch({ type: 'StartAutorun' });
            }}
          />
        )}
        {status === 'ready' && (
          <Button
            title="pause"
            onPress={() => {
              dispatch({ type: 'PauseAutorun' });
            }}
          />
        )}
        {status === 'fault' && (
          <AsyncButton
            title="home system"
            disabled={kitchenState.FillSystem_PrgStep_READ !== 0}
            onPress={() =>
              cloud.dispatch({
                type: 'KitchenCommand',
                commandType: 'Home',
              })
            }
          />
        )}
      </View>
    </View>
  );
}
