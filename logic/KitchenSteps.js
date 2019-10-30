import { getCupsInventoryState } from './KitchenState';

const KitchenSteps = [
  {
    // pickup cup
    getDescription: intent => 'Pickup Cup',
    getStateIntent: restaurantState => {
      const task = restaurantState.queue && restaurantState.queue[0];
      // console.log(
      //   'checking for inventory',
      //   task,

      //   restaurantState.slotInventory,
      // );
      if (
        restaurantState.queue &&
        restaurantState.queue.length &&
        // hasEstimatedInventoryForTask(restaurantState, task),
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
    // ditch unknown cup (fill system)
    getDescription: intent => 'Ditch Unknown Cup',
    getStateIntent: restaurantState => {
      if (restaurantState.fill == null || restaurantState.fill === 'ready') {
        return {};
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
      didCompleteTask: false,
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
    getDescription: ({ amount, system, slot, dryRunDispense }) => {
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
      const intent = {
        ...nextFill,
        taskId: restaurantState.fill.task.id,
        dryRunDispense: restaurantState.isDryRunning,
      };
      return intent;
    },
    getKitchenCommand: intent => {
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
    getSuccessRestaurantAction: intent => ({
      type: intent.dryRunDispense ? 'DidPretendFill' : 'DidFill',
      ...intent,
    }),
    getFailureRestaurantAction: intent => ({
      type: 'DidFailFill',
      ...intent,
    }),
  },
  {
    // deliver cup to blender

    getDescription: () => {
      return 'Pass filled cup to blender';
    },
    getStateIntent: restaurantState => {
      if (
        !!restaurantState.blend ||
        !restaurantState.fill ||
        (restaurantState.fill.fillsRemaining &&
          restaurantState.fill.fillsRemaining.length !== 0) ||
        restaurantState.fill.requestedDropTime ||
        (restaurantState.fill.task &&
          restaurantState.fill.task.skipBlend &&
          restaurantState.fill.task.deliveryMode !== 'deliver')
      ) {
        return null;
      }
      return {
        taskId: restaurantState.fill.task && restaurantState.fill.task.id,
      };
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
        (!restaurantState.blend.task || restaurantState.blend.task.skipBlend)
      ) {
        return null;
      }
      return {
        blendProfile: restaurantState.blend.task.blendProfile,
        taskId: restaurantState.blend.task.id,
      };
    },
    getKitchenCommand: intent => ({
      commandType: 'Blend',
      params: {
        profile: intent.blendProfile,
      },
    }),
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
      if (restaurantState.queue && restaurantState.queue.length) {
        // here we say that we don't want to go to the cup position when we have a queued blend and we have cups in stock. This is to avoid a race condition with GetCup, which happens on the fill system instead of the positioner. Because they are on different systems, a race condition is likely
        const { isEmpty } = getCupsInventoryState(kitchenState);
        if (!isEmpty) return null;
      }
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
];

export default KitchenSteps;
