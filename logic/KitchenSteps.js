import { getCupsInventoryState } from './KitchenState';

const KitchenSteps = [
  {
    // pickup cup
    getDescription: intent => 'Pickup Cup',
    getStateIntent: restaurantState => {
      const task = restaurantState.queue && restaurantState.queue[0];
      if (restaurantState.reservedFillGripperClean) {
        return null;
      }
      if (
        restaurantState.queue &&
        restaurantState.queue.length &&
        (!restaurantState.fill || restaurantState.fill === 'ready')
      ) {
        return {
          taskId: restaurantState.queue[0].id,
        };
      }
      return null;
    },
    getKitchenCommand: intent => ({
      commandType: 'GetCup',
    }),
    getSuccessRestaurantAction: () => ({
      type: 'DidStartCup',
    }),
    getMachineReady: kitchenState => {
      const { isEmpty } = getCupsInventoryState(kitchenState);
      return !isEmpty;
    },
    // getFailureRestaurantAction: (intent) => ({
    //   type: 'KitchenFailure',
    //   intent
    // })
  },
  {
    // drop cup (fill system)
    getDescription: intent => 'Drop Cup',
    getStateIntent: restaurantState => {
      if (
        restaurantState.fill &&
        restaurantState.fill !== 'ready' &&
        restaurantState.fill.task &&
        restaurantState.fill.task.deliveryMode === 'drop' &&
        restaurantState.fill.task.skipBlend &&
        (!restaurantState.fill.fillsRemaining ||
          restaurantState.fill.fillsRemaining.length === 0)
      ) {
        return { didCompleteTask: true, taskId: restaurantState.fill.task.id };
      }
      return null;
    },
    getKitchenCommand: intent => ({
      commandType: 'DropCup',
    }),
    getSuccessRestaurantAction: intent => ({
      type: 'DidLooseFillCup',
      didCompleteTask: intent.didCompleteTask,
    }),
  },
  {
    // ditch requested cup (fill system)
    getDescription: intent => 'Ditch Cup',
    getStateIntent: restaurantState => {
      if (restaurantState.fill && restaurantState.fill.requestedDropTime) {
        return {
          didCompleteTask: false,
          taskId: restaurantState.fill.task.id,
        };
      }
      if (
        restaurantState.fill &&
        restaurantState.fill !== 'ready' &&
        restaurantState.fill.task &&
        restaurantState.fill.task.skipBlend &&
        restaurantState.fill.task.deliveryMode === 'ditch' &&
        (!restaurantState.fill.fillsRemaining ||
          restaurantState.fill.fillsRemaining.length === 0)
      ) {
        return {
          didCompleteTask: true,
          taskId: restaurantState.fill.task.id,
        };
      }
      return null;
    },
    getMachineReady: kitchenState => {
      return kitchenState.FillPositioner_CupPresent_READ;
    },
    getKitchenCommand: intent => ({
      commandType: 'DitchCup',
    }),
    getSuccessRestaurantAction: intent => ({
      type: 'DidLooseFillCup',
      didCompleteTask: intent.didCompleteTask,
    }),
  },
  {
    // drop cup (delivery system)
    getDescription: intent => 'Delivery Drop Cup',
    getStateIntent: restaurantState => {
      if (restaurantState.delivery) {
        return {
          taskId:
            restaurantState.delivery.task && restaurantState.delivery.task.id,
        };
      }
      return null;
    },
    getMachineReady: (kitchenState, intent) => {
      return (
        // !kitchenState.System_VanPluggedIn_READ &&
        !kitchenState.System_SkidPositionSensors_READ
      );
    },
    getKitchenCommand: intent => ({
      commandType: 'DeliveryDropCup',
    }),
    getSuccessRestaurantAction: intent => ({
      type: 'DidDeliveryDropCup',
    }),
  },

  {
    // deliver cup to 0 (delivery system)
    getDescription: intent => 'Deliver to 0',
    getStateIntent: restaurantState => {
      if (restaurantState.delivery && !restaurantState.delivery0) {
        return {
          taskId:
            restaurantState.delivery.task && restaurantState.delivery.task.id,
        };
      }
      return null;
    },
    getMachineReady: (kitchenState, intent) => {
      return (
        kitchenState.System_VanPluggedIn_READ &&
        kitchenState.System_SkidPositionSensors_READ
      );
    },
    getKitchenCommand: intent => ({ commandType: 'DeliverBay0' }),
    getStartingRestaurantAction: intent => ({
      type: 'WillDeliver',
      bayId: 'delivery0',
    }),
    getSuccessRestaurantAction: intent => ({
      type: 'DidDeliver',
      bayId: 'delivery0',
    }),
  },

  {
    // deliver cup to 1 (delivery system)
    getDescription: intent => 'Deliver to 1',
    getStateIntent: restaurantState => {
      if (restaurantState.delivery && !restaurantState.delivery1) {
        return {
          taskId:
            restaurantState.delivery.task && restaurantState.delivery.task.id,
        };
      }
      return null;
    },
    getMachineReady: (kitchenState, intent) => {
      return (
        kitchenState.System_VanPluggedIn_READ &&
        kitchenState.System_SkidPositionSensors_READ
      );
    },
    getKitchenCommand: intent => ({ commandType: 'DeliverBay1' }),
    getStartingRestaurantAction: intent => ({
      type: 'WillDeliver',
      bayId: 'delivery1',
    }),
    getSuccessRestaurantAction: intent => ({
      type: 'DidDeliver',
      bayId: 'delivery1',
    }),
  },

  {
    // do fill
    getDescription: ({
      amount,
      ingredientName,
      system,
      slot,
      dryRunDispense,
      isFillInvalid,
      isDisabled,
      isEmpty,
    }) => {
      if (isFillInvalid) {
        if (isDisabled) return `Skip filling ${ingredientName} - Disabled`;
        if (isEmpty) return `Skip filling ${ingredientName} - Empty`;
        return `Skip filling ${ingredientName} - Invalid`;
      }
      if (dryRunDispense) {
        return `Dry/Fake Fill Cup ${system}.${slot}x${amount}`;
      }
      return `Fill Cup ${system}.${slot}x${amount}`;
    },
    getStateIntent: restaurantState => {
      if (
        !restaurantState.fill ||
        !restaurantState.fill.fillsRemaining ||
        restaurantState.fill.fillsRemaining.length === 0
      ) {
        return null;
      }
      const nextFill = restaurantState.fill.fillsRemaining[0];
      const slotId = nextFill.slotId;
      const slotInventory =
        restaurantState.slotInventory && restaurantState.slotInventory[slotId];
      const estimatedRemaining =
        (slotInventory && slotInventory.estimatedRemaining) || 0;
      const isEmpty = nextFill.amount > estimatedRemaining;
      const settings =
        restaurantState.slotSettings && restaurantState.slotSettings[slotId];
      const disabledMode = (settings && settings.disabledMode) || false;
      const isDisabled = disabledMode === true;
      const isFillInvalid = isDisabled;
      const isFillOptional = (settings && settings.optional) || false;
      const intent = {
        ...nextFill,
        isFillInvalid,
        isBlendInvalid: isFillInvalid && !isFillOptional,
        isFillOptional,
        isDisabled,
        isEmpty,
        taskId: restaurantState.fill.task.id,
        dryRunDispense: restaurantState.isDryRunning,
      };
      return intent;
    },
    getKitchenCommand: intent => {
      if (intent.isFillInvalid) {
        return null;
      }
      if (intent.dryRunDispense) {
        return {
          commandType: 'PositionToSystemSlot',
          params: intent,
        };
      }
      return {
        commandType: 'PositionAndDispenseAmount',
        params: intent,
      };
    },
    getSuccessRestaurantAction: intent => {
      if (intent.isFillInvalid) {
        return {
          ...intent, // (we need system,amount,slot)
          type: 'DidFailFill',
        };
      }
      if (intent.dryRunDispense) {
        return {
          ...intent, // (we need system,amount,slot)
          type: 'DidPretendFill',
        };
      }
      return {
        ...intent, // (we need system,amount,slot)
        type: 'DidFill',
      };
    },
    getFailureRestaurantAction: intent => ({
      type: 'DidFailFill',
      ...intent,
    }),
  },
  {
    // deliver cup to blender

    getDescription: () => {
      return 'Pass cup to blender';
    },
    getStateIntent: restaurantState => {
      if (
        restaurantState.fill &&
        restaurantState.fill !== 'ready' &&
        !restaurantState.blend &&
        !restaurantState.reservedBlenderClean &&
        (restaurantState.fill.fillsRemaining
          ? restaurantState.fill.fillsRemaining.length === 0
          : true)
      ) {
        return {
          taskId: restaurantState.fill.task && restaurantState.fill.task.id,
        };
      }
      return null;
    },
    getKitchenCommand: intent => ({
      commandType: 'PassToBlender',
    }),
    getStartingRestaurantAction: intent => ({
      type: 'WillPassToBlender',
    }),
    getSuccessRestaurantAction: intent => ({
      type: 'DidPassToBlender',
    }),
  },
  {
    // go get ready to deliver cup to blender

    // this step is intentionally _below_ "pass filled cup to blender", which means the handoff will be prioritized rather than this step
    getDescription: () => {
      return 'Go to handoff position';
    },
    getStateIntent: (restaurantState, kitchenState) => {
      if (
        !restaurantState.blend ||
        !restaurantState.fill ||
        !restaurantState.fill.fillsRemaining ||
        restaurantState.fill.moveToBlenderTime ||
        restaurantState.fill.fillsRemaining.length !== 0 ||
        restaurantState.fill.requestedDropTime ||
        (restaurantState.fill.task &&
          restaurantState.fill.task.skipBlend &&
          restaurantState.fill.task.deliveryMode !== 'deliver')
      ) {
        return null;
      }
      return {
        position: kitchenState.FillSystem_Blender_Pos_READ,
        taskId: restaurantState.fill.task.id,
      };
    },
    getKitchenCommand: intent => ({
      commandType: 'FillGoToHandoff',
      ...intent,
    }),
    getSuccessRestaurantAction: intent => ({
      type: 'DidFillGoToHandoff',
    }),
  },
  {
    // blend

    getDescription: () => {
      return 'Blend';
    },
    getStateIntent: restaurantState => {
      if (
        restaurantState.isDryRunning === true ||
        !restaurantState.blend ||
        restaurantState.blend === 'dirty' ||
        restaurantState.blend.blendCompleteTime ||
        !restaurantState.blend.task ||
        restaurantState.blend.task.skipBlend
      ) {
        return null;
      }
      return {
        blendProfile: restaurantState.blend.task.blendProfile,
        taskId: restaurantState.blend.task.id,
      };
    },
    getKitchenCommand: intent => {
      const params = {
        Timer1: 0,
        Speed1: 0,
        Pulse1: 0,
        Timer2: 0,
        Speed2: 0,
        Pulse2: 0,
        Timer3: 0,
        Speed3: 0,
        Pulse3: 0,
        Timer4: 0,
        Speed4: 0,
        Pulse4: 0,
      };
      if (intent.blendProfile) {
        params.Timer1 = intent.blendProfile.Timer1 || 0;
        params.Speed1 = intent.blendProfile.Speed1 || 0;
        params.Pulse1 = intent.blendProfile.Pulse1 || 0;
        params.Timer2 = intent.blendProfile.Timer2 || 0;
        params.Speed2 = intent.blendProfile.Speed2 || 0;
        params.Pulse2 = intent.blendProfile.Pulse2 || 0;
        params.Timer3 = intent.blendProfile.Timer3 || 0;
        params.Speed3 = intent.blendProfile.Speed3 || 0;
        params.Pulse3 = intent.blendProfile.Pulse3 || 0;
        params.Timer4 = intent.blendProfile.Timer4 || 0;
        params.Speed4 = intent.blendProfile.Speed4 || 0;
        params.Pulse4 = intent.blendProfile.Pulse4 || 0;
      }
      return {
        commandType: 'Blend',
        params,
      };
    },
    getSuccessRestaurantAction: intent => ({
      type: 'DidBlend',
    }),
  },
  {
    // pass cup to delivery

    getDescription: () => {
      return 'Pass from blender to delivery system';
    },
    getStateIntent: restaurantState => {
      if (!restaurantState.blend || restaurantState.blend === 'dirty') {
        return null;
      }
      if (
        restaurantState.blend.blendCompleteTime ||
        restaurantState.isDryRunning
      ) {
        return {
          taskId: restaurantState.blend.task && restaurantState.blend.task.id,
        };
      }
      if (!restaurantState.blend.task || restaurantState.blend.task.skipBlend) {
        return {
          taskId: restaurantState.blend.task && restaurantState.blend.task.id,
        };
      }
      return null;
    },
    getKitchenCommand: intent => ({
      commandType: 'PassToDeliveryWithoutClean',
    }),
    getStartingRestaurantAction: intent => ({
      type: 'WillPassToDelivery',
    }),
    getSuccessRestaurantAction: intent => ({
      type: 'DidPassToDelivery',
    }),
  },
  {
    // clean
    getDescription: () => {
      return 'Clean Blender';
    },
    getStateIntent: restaurantState => {
      if (restaurantState.blend !== 'dirty') {
        return null;
      }
      return {};
    },
    getKitchenCommand: intent => ({
      commandType: 'Clean',
    }),
    getSuccessRestaurantAction: intent => ({
      type: 'DidClean',
    }),
  },
  {
    // prepare pickup cup
    getDescription: intent => 'Go to cup position',
    getStateIntent: (restaurantState, kitchenState) => {
      if (restaurantState.fill == null) {
        return {
          position: kitchenState.FillSystem_Cup_Pos_READ,
        };
      }
      return null;
    },
    getKitchenCommand: intent => ({
      commandType: 'FillGoToCup',
      ...intent,
    }),
    getSuccessRestaurantAction: intent => ({
      type: 'DidFillGoToCup',
    }),
  },

  {
    getDescription: intent => 'Lower Elevator',
    getStateIntent: (restaurantState, kitchenState) => {
      if (
        restaurantState.reservedBlenderClean &&
        restaurantState.reservedBlenderClean.mode === 'lifter'
      ) {
        return null;
      }
      if (
        kitchenState &&
        kitchenState.BlendSystem_LowerBlenderElevatorReady_READ
      ) {
        return {};
      }
      return null;
    },
    getKitchenCommand: intent => ({
      commandType: 'LowerBlenderElevator',
      ...intent,
    }),
  },

  {
    getDescription: intent => 'Extend Arm',
    getStateIntent: (restaurantState, kitchenState) => {
      if (
        restaurantState.reservedBlenderClean &&
        restaurantState.reservedBlenderClean.mode === 'arm'
      ) {
        return null;
      }
      if (kitchenState && kitchenState.BlendSystem_ExtendArmReady_READ) {
        return {};
      }
      return null;
    },
    getKitchenCommand: intent => ({
      commandType: 'ExtendArm',
      ...intent,
    }),
  },

  {
    getDescription: intent => 'Return Blade',
    getStateIntent: (restaurantState, kitchenState) => {
      if (
        restaurantState.reservedBlenderClean &&
        restaurantState.reservedBlenderClean.mode === 'blender'
      ) {
        return null;
      }
      if (kitchenState && kitchenState.BlendSystem_ReturnBladeReady_READ) {
        return {};
      }
      return null;
    },
    getKitchenCommand: intent => ({
      commandType: 'ReturnBlade',
      ...intent,
    }),
  },

  {
    getDescription: intent => 'Flip Blade',
    getStateIntent: (restaurantState, kitchenState) => {
      if (
        restaurantState.reservedBlenderClean &&
        restaurantState.reservedBlenderClean.mode === 'blender' &&
        !restaurantState.reservedBlenderClean.didFlipBlade
      ) {
        return {};
      }
      return null;
    },
    getKitchenCommand: intent => ({
      commandType: 'FlipBlade',
      ...intent,
    }),
    getSuccessRestaurantAction: intent => ({
      type: 'DidFlipBlade',
    }),
  },

  {
    getDescription: intent => 'Lift Elevator',
    getStateIntent: (restaurantState, kitchenState) => {
      if (
        restaurantState.reservedBlenderClean &&
        restaurantState.reservedBlenderClean.mode === 'lifter'
      ) {
        return {};
      }
      return null;
    },
    getKitchenCommand: intent => ({
      commandType: 'LiftBlenderElevator',
      ...intent,
    }),
  },

  {
    getDescription: intent => 'Retract Arm',
    getStateIntent: (restaurantState, kitchenState) => {
      if (
        restaurantState.reservedBlenderClean &&
        restaurantState.reservedBlenderClean.mode === 'arm' &&
        !restaurantState.reservedBlenderClean.didRetractArm
      ) {
        return {};
      }
      return null;
    },
    getKitchenCommand: intent => ({
      commandType: 'RetractArm',
      ...intent,
    }),
    getSuccessRestaurantAction: intent => ({
      type: 'DidRetractArm',
    }),
  },
];

export default KitchenSteps;
