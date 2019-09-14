import React from 'react';
import { View } from 'react-native';
import Button from './Button';
import useOrderInfoPopover from './useOrderInfoPopover';
import useBlendPickPopover from './useBlendPickPopover';
import { useCloud } from '../cloud-core/KiteReact';
import Row from './Row';
import TaskInfo from './TaskInfo';
import FillList from './FillList';
import cuid from 'cuid';
import {
  useInventoryMenuItem,
  useCompanyConfig,
} from '../ono-cloud/OnoKitchen';
import { usePopover } from '../views/Popover';
import BlendCustomization from './BlendCustomization';
import { getFillsOfOrderItem } from '../logic/configLogic';
import { Easing } from 'react-native-reanimated';

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
  const [orderName, setOrderName] = React.useState('Friend');
  const [blendId, setBlendId] = React.useState(null);
  const [blendName, setBlendName] = React.useState(null);
  const [customization, setCustomization] = React.useState(null);

  const openBlendChooser = useBlendPickPopover({
    blendId,
    setBlendId: blendId => {
      setBlendId(blendId);
      setCustomization(null);
    },
    setBlendName,
  });

  const { menuItem, inventoryIngredients } = useInventoryMenuItem(blendId);

  const openOrderInfo = useOrderInfoPopover({
    hideBlendName: true,
    orderName,
    onOrderInfo: ({ orderName }) => setOrderName(orderName),
  });
  const restaurantDispatch = usePutTransactionValue('RestaurantActions');
  const companyConfig = useCompanyConfig();
  const fills = getFillsOfOrderItem(menuItem, { customization }, companyConfig);
  const blendDisplayName = customization ? `custom ${blendName}` : blendName;
  return (
    <Row title="free blend">
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, justifyContent: 'flex-start' }}>
            <TaskInfo task={{ name: orderName, blendName: blendDisplayName }} />
            <Button
              title="set order info"
              type="outline"
              onPress={openOrderInfo}
            />
            {blendId && (
              <CustomizeButton
                menuItem={menuItem}
                customization={customization}
                setCustomization={setCustomization}
              />
            )}
            <Button
              title="choose blend"
              type="outline"
              onPress={openBlendChooser}
            />
          </View>
          <View style={{ flex: 1 }}>
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
                {
                  id: cuid(),
                  name: orderName,
                  blendName,
                  blendColor: menuItem.Recipe.Color,
                  blendProfile: menuItem.Recipe['Blend Profile'],
                  skipBlend: false,
                  deliveryMode: 'deliver',
                  fills,
                },
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
