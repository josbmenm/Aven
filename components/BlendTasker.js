import React from 'react';
import { View, Text } from 'react-native';
import Button from '../dash-ui/Button';
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
import useAsyncStorage, {
  isStateUnloaded,
} from '../components/useAsyncStorage';
import ButtonStack from './ButtonStack';
import { primaryFontFace } from './Styles';
import { Spacing } from '../dash-ui/Theme';
import Stack from '../dash-ui/Stack';

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
        <Stack>
          <Button
            onPress={() => {
              onClose();
            }}
            outline
            title="cancel"
          />
          <Button
            onPress={() => {
              saveCustomization(customizationState);
              onClose();
            }}
            title="save"
          />
        </Stack>
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

  return <Button title="customize" onPress={onPopover} outline />;
}

export default function BlendTasker() {
  const [savedTask, setSavedTask] = useAsyncStorage('OnoSavedBlend.2', {
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
    <Button title="set order info" outline onPress={openOrderInfo} />,
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
    <Button title="choose blend" outline onPress={openBlendChooser} />,
  );
  const allProfiles = companyConfig && companyConfig.baseTables.BlendProfiles;
  const profileId =
    menuItem && menuItem.Recipe.BlendProfile && menuItem.Recipe.BlendProfile[0];
  const blendProfile =
    (profileId && allProfiles && allProfiles[profileId]) || {};
  return (
    <Row title="free blend">
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flex: 2, justifyContent: 'flex-start' }}>
            <TaskInfo task={{ name: orderName, blendName: blendDisplayName }} />
            <Text style={{ ...primaryFontFace }}>
              Blend Profile: {(blendProfile && blendProfile.Name) || 'None'}
            </Text>
            <ButtonStack buttons={buttons} />
          </View>
          <View style={{ flex: 3 }}>
            {fills && (
              <FillList
                fills={fills}
                inventoryIngredients={inventoryIngredients}
                onFillsChange={null}
              />
            )}
            {/* <Button
              title="customize"
              outline
              onPress={openBlendChooser}
            /> */}
          </View>
        </View>
        <Spacing vertical={8}>
          <Button
            title="queue task"
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
                .then(() => {})
                .catch(console.error);
            }}
          />
        </Spacing>
      </View>
    </Row>
  );
}
