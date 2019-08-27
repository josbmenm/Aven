import React from 'react';
import TwoPanePage from '../components/TwoPanePage';
import Button from '../components/Button';
import KitchenCommands from '../logic/KitchenCommands';
import { useCloud, useCloudValue } from '../cloud-core/KiteReact';
import { View } from 'react-native';
import RowSection from '../components/RowSection';
import { useRestaurantState } from '../ono-cloud/Kitchen';
import useAsyncError from '../react-utils/useAsyncError';

export default function ManualControl() {
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
              type: 'KitchenCommand',
              commandType: 'Home',
            }),
          );
        }}
      />
      <Button
        title="position under new cup"
        disabled={!KitchenCommands.FillGoToCup.checkReady(kitchenState)}
        onPress={() => {
          handleErrors(
            cloud.dispatch({
              type: 'KitchenCommand',
              commandType: 'FillGoToCup',
            }),
          );
        }}
      />
      <Button
        title="position blender handoff"
        disabled={!KitchenCommands.FillGoToHandoff.checkReady(kitchenState)}
        onPress={() => {
          handleErrors(
            cloud.dispatch({
              type: 'KitchenCommand',
              commandType: 'FillGoToHandoff',
            }),
          );
        }}
      />
      <Button
        title="grab new cup"
        disabled={!KitchenCommands.GetCup.checkReady(kitchenState)}
        onPress={() => {
          handleErrors(
            cloud.dispatch({
              type: 'KitchenCommand',
              commandType: 'GetCup',
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
              type: 'KitchenCommand',
              commandType: 'DropCup',
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
              type: 'KitchenCommand',
              commandType: 'DeliveryDropCup',
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
              type: 'KitchenCommand',
              commandType: 'DitchCup',
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
              type: 'KitchenCommand',
              commandType: 'PositionAndDispenseAmount',
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
              type: 'KitchenCommand',
              commandType: 'PassToBlender',
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
              type: 'KitchenCommand',
              commandType: 'Blend',
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
              type: 'KitchenCommand',
              commandType: 'PassToDelivery',
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
              type: 'KitchenCommand',
              commandType: 'PassToDeliveryWithoutClean',
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
              type: 'KitchenCommand',
              commandType: 'Clean',
            }),
          );
        }}
      />
    </RowSection>
  );
}
