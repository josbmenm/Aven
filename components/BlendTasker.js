import React from 'react';
import { View } from 'react-native';
import Button from './Button';
import useOrderInfoPopover from './useOrderInfoPopover';
import useBlendPickPopover from './useBlendPickPopover';
import { useCloud } from '../cloud-core/KiteReact';
import Row from './Row';
import TaskInfo from './TaskInfo';
import FillList from './FillList';
import {
  useInventoryMenuItem,
  useCompanyConfig,
} from '../ono-cloud/OnoKitchen';
import { usePopover } from '../views/Popover';
import BlendCustomization from './BlendCustomization';
import { getFillsOfOrderItem, getNewBlendTask } from '../logic/configLogic';
import { Easing } from 'react-native-reanimated';
import useAsyncStorage, { isStateUnloaded } from '../screens/useAsyncStorage';
import ButtonStack from './ButtonStack';

function usePutTransactionValue(docName) {
  const cloud = useCloud();
  const doc = cloud.get(docName);
  return doc.putTransactionValue;
}

function CustomizePopover({
  onClose,
  menuItem,
  customization,
  saveCustomization,
}) {
  const [customizationState, setCustomization] = React.useState(customization);
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <BlendCustomization
        menuItem={menuItem}
        customizationState={customizationState}
        setCustomization={setCustomization}
      />
      <View style={{ flexDirection: 'row', paddingHorizontal: 8 }}>
        <Button
          onPress={() => {
            onClose();
          }}
          style={{ marginVertical: 16, marginHorizontal: 8, flex: 1 }}
          type="outline"
          title="cancel"
        />
        <Button
          onPress={() => {
            saveCustomization(customizationState);
            onClose();
          }}
          style={{ marginVertical: 16, marginHorizontal: 8, flex: 1 }}
          title="save"
        />
      </View>
    </View>
  );
}

function CustomizeButton({ menuItem, setCustomization, customization }) {
  const { onPopover } = usePopover(
    ({ onClose }) => {
      return (
        <CustomizePopover
          menuItem={menuItem}
          customization={customization}
          saveCustomization={setCustomization}
          onClose={onClose}
        />
      );
    },
    { easing: Easing.inOut(Easing.poly(5)), duration: 500 },
  );

  return <Button title="customize" onPress={onPopover} type="outline" />;
}

export default function BlendTasker() {
  const [savedTask, setSavedTask] = useAsyncStorage('OnoSavedBlend', {
    orderName: 'Tester O.',
    blendName: null,
    blendId: null,
    customization: null,
  });
  const { orderName, blendId, blendName, customization } = savedTask;

  const openBlendChooser = useBlendPickPopover({
    blendId,
    onBlendPick: ({ blendId, blendName }) => {
      setSavedTask({ ...savedTask, blendId, blendName, customization: {} });
    },
  });

  const { menuItem, inventoryIngredients } = useInventoryMenuItem(blendId);

  const openOrderInfo = useOrderInfoPopover({
    hideBlendName: true,
    orderName,
    onOrderInfo: ({ orderName }) => setSavedTask({ ...savedTask, orderName }),
  });
  const restaurantDispatch = usePutTransactionValue('RestaurantActions');
  const companyConfig = useCompanyConfig();
  const fills = getFillsOfOrderItem(menuItem, { customization }, companyConfig);
  const blendDisplayName =
    customization && (customization.enhancements || customization.ingredients)
      ? `custom ${blendName}`
      : blendName;
  const buttons = [
    <Button title="set order info" type="outline" onPress={openOrderInfo} />,
  ];
  blendId &&
    buttons.push(
      <CustomizeButton
        menuItem={menuItem}
        customization={customization}
        setCustomization={customization =>
          setSavedTask({ ...savedTask, customization })
        }
      />,
    );
  buttons.push(
    <Button title="choose blend" type="outline" onPress={openBlendChooser} />,
  );
  return (
    <Row title="free blend">
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flex: 2, justifyContent: 'flex-start' }}>
            <TaskInfo task={{ name: orderName, blendName: blendDisplayName }} />
            <ButtonStack buttons={buttons} />
          </View>
          <View style={{ flex: 3, paddingLeft: 20 }}>
            {fills && (
              <FillList
                fills={fills}
                inventoryIngredients={inventoryIngredients}
                onFillsChange={null}
              />
            )}
            {/* <Button
              title="customize"
              type="outline"
              onPress={openBlendChooser}
            /> */}
          </View>
        </View>

        <Button
          title="queue task"
          style={{ marginVertical: 8 }}
          disabled={blendId === null || !fills}
          onPress={() => {
            restaurantDispatch({
              type: 'QueueTasks',
              tasks: [
                getNewBlendTask(
                  menuItem,
                  fills,
                  orderName,
                  {
                    blendName,
                  },
                  companyConfig,
                ),
              ],
            })
              .then(() => {
                console.log('order placed!');
              })
              .catch(console.error);
          }}
        />
      </View>
    </Row>
  );
}
