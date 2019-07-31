import React from 'react';
import TwoPanePage from '../components/TwoPanePage';
import Button from '../components/Button';
import KitchenCommands from '../logic/KitchenCommands';
import {
  useCloud,
  useCloudReducer,
  useCloudValue,
} from '../cloud-core/KiteReact';
import { View } from 'react-native';
import RowSection from '../components/RowSection';
import RestaurantReducer from '../logic/RestaurantReducer';
import useAsyncError from '../react-utils/useAsyncError';

function ManualActionsSection() {
  const cloud = useCloud();
  const handleErrors = useAsyncError();
  const kitchenState = useCloudValue('KitchenState');
  const fillParams = {
    amount: 2,
    system: 3,
    slot: 1,
  };
  return (
    <RowSection title="Manual Actions">
      <Button
        title="home system"
        onPress={() => {
          handleErrors(
            cloud.dispatch({
              type: 'KitchenAction',
              command: 'Home',
            }),
          );
        }}
      />
      <Button
        title="grab new cup"
        onPress={() => {
          handleErrors(
            cloud.dispatch({
              type: 'KitchenAction',
              command: 'GetCup',
            }),
          );
        }}
      />
      <Button
        title="drop cup (from fill system)"
        disabled={!KitchenCommands.DropCup.checkReady(kitchenState)}
        onPress={() => {
          handleErrors(
            cloud.dispatch({
              type: 'KitchenAction',
              command: 'DropCup',
            }),
          );
        }}
      />
      <Button
        title="drop cup (from delivery system)"
        disabled={!KitchenCommands.DeliveryDropCup.checkReady(kitchenState)}
        onPress={() => {
          handleErrors(
            cloud.dispatch({
              type: 'KitchenAction',
              command: 'DeliveryDropCup',
            }),
          );
        }}
      />
      <Button
        title="ditch cup (from fill system)"
        disabled={!KitchenCommands.DitchCup.checkReady(kitchenState)}
        onPress={() => {
          handleErrors(
            cloud.dispatch({
              type: 'KitchenAction',
              command: 'DitchCup',
            }),
          );
        }}
      />
      <Button
        title="dispense 2 cocoa powder"
        disabled={
          !KitchenCommands.PositionAndDispenseAmount.checkReady(
            kitchenState,
            fillParams,
          )
        }
        onPress={() => {
          handleErrors(
            cloud.dispatch({
              type: 'KitchenAction',
              command: 'PositionAndDispenseAmount',
              params: fillParams,
            }),
          );
        }}
      />
      <Button
        title="pass to blender"
        disabled={!KitchenCommands.PassToBlender.checkReady(kitchenState)}
        onPress={() => {
          handleErrors(
            cloud.dispatch({
              type: 'KitchenAction',
              command: 'PassToBlender',
            }),
          );
        }}
      />
      <Button
        title="blend"
        disabled={!KitchenCommands.Blend.checkReady(kitchenState)}
        onPress={() => {
          handleErrors(
            cloud.dispatch({
              type: 'KitchenAction',
              command: 'Blend',
            }),
          );
        }}
      />
      <Button
        title="pass to delivery"
        disabled={!KitchenCommands.PassToDelivery.checkReady(kitchenState)}
        onPress={() => {
          handleErrors(
            cloud.dispatch({
              type: 'KitchenAction',
              command: 'PassToDelivery',
            }),
          );
        }}
      />
      <Button
        title="pass to delivery without clean"
        disabled={
          !KitchenCommands.PassToDeliveryWithoutClean.checkReady(kitchenState)
        }
        onPress={() => {
          handleErrors(
            cloud.dispatch({
              type: 'KitchenAction',
              command: 'PassToDeliveryWithoutClean',
            }),
          );
        }}
      />
      <Button
        title="clean"
        disabled={!KitchenCommands.Clean.checkReady(kitchenState)}
        onPress={() => {
          handleErrors(
            cloud.dispatch({
              type: 'KitchenAction',
              command: 'Clean',
            }),
          );
        }}
      />
    </RowSection>
  );
}

function ModeView({ restaurantState, dispatch }) {
  return (
    <View>
      {restaurantState.manualMode ? (
        <Button
          title="disable manual mode"
          onPress={() => {
            dispatch({
              type: 'DisableManualMode',
            });
          }}
        />
      ) : (
        <Button
          title="enable manual mode"
          disabled={restaurantState.isAttached}
          onPress={() => {
            dispatch({
              type: 'EnableManualMode',
            });
          }}
        />
      )}
      <Button
        title="prime dispensers"
        onPress={() => {
          dispatch({
            type: 'PrimeDispensers',
          });
        }}
      />
    </View>
  );
}

export default function OrdersScreen(props) {
  const [restaurantState, dispatch] = useCloudReducer(
    'RestaurantActions',
    RestaurantReducer,
  );
  return (
    <TwoPanePage
      {...props}
      title="Manual Control"
      icon="⚡️"
      side={
        restaurantState && (
          <ModeView restaurantState={restaurantState} dispatch={dispatch} />
        )
      }
    >
      {restaurantState && restaurantState.manualMode && (
        <ManualActionsSection />
      )}
    </TwoPanePage>
  );
}

OrdersScreen.navigationOptions = TwoPanePage.navigationOptions;
