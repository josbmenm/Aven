function delay(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
function checkKitchenState(kitchenState, kitchenConfig) {
  if (!kitchenState) {
    return {
      isFaulted: true,
      faultedSystems: [],
      isRunning: false,
      runningSystems: [],
    };
  }
  let isFaulted = false;
  let isRunning = false;
  const runningSystems = [];
  const faultedSystems = [];
  const sequencerNames =
    kitchenConfig &&
    Object.keys(kitchenConfig.subsystems)
      .map(k => kitchenConfig.subsystems[k])
      .filter(subsystem => subsystem.hasSequencer)
      .map(s => s.name);
  if (!sequencerNames) {
    return { isFaulted, faultedSystems, isRunning, runningSystems };
  }
  sequencerNames.forEach(systemName => {
    if (kitchenState[`${systemName}_NoFaults_READ`] === false) {
      isFaulted = true;
      faultedSystems.push(systemName);
    }
  });
  sequencerNames.forEach(systemName => {
    if (kitchenState[`${systemName}_PrgStep_READ`] !== 0) {
      isRunning = true;
      runningSystems.push(systemName);
    }
  });

  return { isFaulted, faultedSystems, isRunning, runningSystems };
}

const SEQUENCER_STEPS = [
  {
    // pickup cup
    getDescription: intent => 'Pickup Cup',
    getRestaurantStateIntent: restaurantState => {
      if (
        restaurantState.queue &&
        restaurantState.queue.length &&
        !restaurantState.fill
      ) {
        return {};
      }
      return null;
    },
    getKitchenStateReady: (kitchenState, intent) => {
      return !!kitchenState && kitchenState.FillSystem_PickUpNewCupReady_READ;
    },
    getKitchenCommand: intent => ({
      command: 'GetCup',
    }),
    getSuccessRestaurantAction: () => ({
      type: 'DidGetCup',
    }),
    // getFailureRestaurantAction: (intent) => ({
    //   type: 'KitchenFailure',
    //   intent
    // })
  },
  {
    // drop cup (fill system)
    getDescription: intent => 'Drop Cup',
    getRestaurantStateIntent: restaurantState => {
      if (restaurantState.fill && !!restaurantState.fill.requestedDropTime) {
        return { didCompleteJob: false };
      }
      if (
        restaurantState.fill &&
        restaurantState.fill.task &&
        restaurantState.fill.task.deliveryMode === 'drop' &&
        restaurantState.fill.task.skipBlend &&
        restaurantState.fill.fillsRemaining.length === 0
      ) {
        return { didCompleteJob: true };
      }
      return null;
    },
    getKitchenStateReady: (kitchenState, intent) => {
      return !!kitchenState && kitchenState.FillSystem_DropCupReady_READ;
    },
    getKitchenCommand: intent => ({
      command: 'DropCup',
    }),
    getSuccessRestaurantAction: intent => ({
      type: 'DidLooseFillCup',
      didCompleteJob: intent.didCompleteJob,
    }),
  },
  {
    // drop cup (delivery system)
    getDescription: intent => 'Delivery Drop Cup',
    getRestaurantStateIntent: restaurantState => {
      if (restaurantState.delivery) {
        return {};
      }
      return null;
    },
    getKitchenStateReady: (kitchenState, intent) => {
      return (
        !!kitchenState &&
        !kitchenState.System_VanPluggedIn_READ &&
        !kitchenState.System_SkidPositionSensors_READ &&
        kitchenState.Delivery_DropCupReady_READ
      );
    },
    getKitchenCommand: intent => ({
      command: 'DeliveryDropCup',
    }),
    getSuccessRestaurantAction: intent => ({
      type: 'DidDeliveryDropCup',
    }),
  },
  {
    // do fill
    getDescription: ({ amount, system, slot }) => {
      return `Fill Cup ${system}.${slot}x${amount}`;
    },
    getRestaurantStateIntent: restaurantState => {
      if (
        !restaurantState.fill ||
        !restaurantState.fill.fillsRemaining ||
        restaurantState.fill.fillsRemaining.length === 0
      ) {
        return null;
      }
      const nextFill = restaurantState.fill.fillsRemaining[0];
      return {
        ...nextFill,
      };
    },
    getKitchenStateReady: (kitchenState, intent) => {
      return !!kitchenState && kitchenState.FillSystem_DropCupReady_READ;
    },
    getKitchenCommand: intent => ({
      command: 'PositionAndDispenseAmount',
      params: intent,
    }),
    getSuccessRestaurantAction: intent => ({
      type: 'DidFill',
      ...intent,
    }),
  },
  {
    // deliver cup to blender

    getDescription: () => {
      return 'Pass filled cup to blender';
    },
    getRestaurantStateIntent: restaurantState => {
      if (
        !!restaurantState.blend ||
        !restaurantState.fill ||
        !restaurantState.fill.fillsRemaining ||
        restaurantState.fill.fillsRemaining.length !== 0 ||
        restaurantState.fill.requestedDropTime ||
        (restaurantState.fill.task.skipBlend &&
          restaurantState.fill.task.deliveryMode !== 'deliver')
      ) {
        return null;
      }
      return {};
    },
    getKitchenStateReady: (kitchenState, intent) => {
      return (
        !!kitchenState && kitchenState.FillSystem_DeliverToBlenderReady_READ
      );
    },
    getKitchenCommand: intent => ({
      command: 'PassToBlender',
    }),
    getSuccessRestaurantAction: intent => ({
      type: 'DidPassToBlender',
    }),
  },
  {
    // blend

    getDescription: () => {
      return 'Blend';
    },
    getRestaurantStateIntent: restaurantState => {
      if (
        !restaurantState.blend ||
        restaurantState.blend === 'dirty' ||
        restaurantState.blend.blendCompleteTime ||
        restaurantState.blend.task.skipBlend
      ) {
        return null;
      }
      return {};
    },
    getKitchenStateReady: (kitchenState, intent) => {
      return !!kitchenState && kitchenState.BlendSystem_BlendReady_READ;
    },
    getKitchenCommand: intent => ({
      command: 'Blend',
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
    getRestaurantStateIntent: restaurantState => {
      if (!restaurantState.blend || restaurantState.blend === 'dirty') {
        return null;
      }
      if (restaurantState.blend.blendCompleteTime) {
        return { didDirtyBlender: true };
      }
      if (restaurantState.blend.task.skipBlend) {
        return { didDirtyBlender: false };
      }
      return null;
    },
    getKitchenStateReady: (kitchenState, intent) => {
      return (
        !!kitchenState && kitchenState.BlendSystem_DeliverWithoutCleanReady_READ
      );
    },
    getKitchenCommand: intent => ({
      command: 'PassToDeliveryWithoutClean',
    }),
    getSuccessRestaurantAction: intent => ({
      type: 'DidPassToDelivery',
      didDirtyBlender: intent.didDirtyBlender,
    }),
  },
  {
    // clean
    getDescription: () => {
      return 'Clean Blender';
    },
    getRestaurantStateIntent: restaurantState => {
      if (restaurantState.blend !== 'dirty') {
        return null;
      }
      return {};
    },
    getKitchenStateReady: (kitchenState, intent) => {
      return !!kitchenState && kitchenState.BlendSystem_CleanOnlyReady_READ;
    },
    getKitchenCommand: intent => ({
      command: 'Clean',
    }),
    getSuccessRestaurantAction: intent => ({
      type: 'DidClean',
    }),
  },
  {
    // drop cup from delivery

    getDescription: () => {
      return 'Drop from delivery system';
    },
    getRestaurantStateIntent: restaurantState => {
      if (!restaurantState.blend || restaurantState.blend === 'dirty') {
        return null;
      }
      if (restaurantState.blend.blendCompleteTime) {
        return { didDirtyBlender: true };
      }
      if (restaurantState.blend.task.skipBlend) {
        return { didDirtyBlender: false };
      }
      return null;
    },
    getKitchenStateReady: (kitchenState, intent) => {
      return (
        !!kitchenState && kitchenState.BlendSystem_DeliverWithoutCleanReady_READ
      );
    },
    getKitchenCommand: intent => ({
      command: 'PassToDeliveryWithoutClean',
    }),
    getSuccessRestaurantAction: intent => ({
      type: 'DidPassToDelivery',
      didDirtyBlender: intent.didDirtyBlender,
    }),
  },
  {
    // ditch cup (fill system)
    getDescription: intent => 'Ditch Cup',
    getRestaurantStateIntent: restaurantState => {
      if (restaurantState.fill === null) {
        return {
          didCompleteJob: false,
        };
      }
      if (
        restaurantState.fill &&
        restaurantState.fill.task.skipBlend &&
        restaurantState.fill.task.deliveryMode === 'ditch' &&
        restaurantState.fill.fillsRemaining.length === 0
      ) {
        return {
          didCompleteJob: true,
        };
      }
      return null;
    },
    getKitchenStateReady: (kitchenState, intent) => {
      return !!kitchenState && kitchenState.FillSystem_DitchCupReady_READ;
    },
    getKitchenCommand: intent => ({
      command: 'DitchCup',
    }),
    getSuccessRestaurantAction: intent => ({
      type: 'DidLooseFillCup',
      didCompleteJob: intent.didCompleteJob,
    }),
  },
];

export function computeNextSteps(restaurantState, kitchenConfig, kitchenState) {
  if (!restaurantState || !kitchenConfig || !kitchenState) {
    return null;
  }
  // if (restaurantState.isAttached) {
  //   const { isFaulted, isRunning } = checkKitchenState(
  //     kitchenState,
  //     kitchenConfig,
  //   );
  //   if (isFaulted || isRunning) {
  //     return null;
  //   }
  // }
  return SEQUENCER_STEPS.map(STEP => {
    const {
      getDescription,
      getRestaurantStateIntent,
      getKitchenStateReady,
      getKitchenCommand,
      getFailureRestaurantAction,
      getStartingRestaurantAction,
      getSuccessRestaurantAction,
    } = STEP;
    const intent = getRestaurantStateIntent(restaurantState);
    if (!intent) {
      return false;
    }

    if (!getKitchenStateReady(kitchenState, intent)) {
      return false;
    }
    const command = getKitchenCommand(intent);
    const successRestaurantAction =
      getSuccessRestaurantAction && getSuccessRestaurantAction(intent);
    const failureRestaurantAction =
      getFailureRestaurantAction && getFailureRestaurantAction(intent);
    const startingRestaurantAction =
      getStartingRestaurantAction && getStartingRestaurantAction(intent);
    return {
      intent,
      command,
      successRestaurantAction,
      failureRestaurantAction,
      startingRestaurantAction,
      subsystem: command.subsystem,
      description: getDescription(intent),
      perform: async (cloud, handleCommand) => {
        let resp = null;
        const startTime = Date.now();
        startingRestaurantAction &&
          (await cloud
            .get('RestaurantActions')
            .putTransactionValue(startingRestaurantAction));
        // await cloud.get('KitchenLog').putTransactionValue({
        //   type: 'StartKitchenAction',
        //   intent,
        //   command,
        // });
        try {
          resp = await handleCommand(command);
          successRestaurantAction &&
            (await cloud
              .get('RestaurantActions')
              .putTransactionValue(successRestaurantAction));
          await delay(30);
          // await cloud.get('KitchenLog').putTransactionValue({
          //   type: 'CompleteKitchenAction',
          //   intent,
          //   command,
          //   duration: Date.now() - startTime,
          // });
        } catch (e) {
          console.error('Failed to perform command', e);
          failureRestaurantAction &&
            (await cloud
              .get('RestaurantActions')
              .putTransactionValue(failureRestaurantAction));
          // await cloud.get('KitchenLog').putTransactionValue({
          //   type: 'CompleteFailureAction',
          //   intent,
          //   command,
          //   error: e,
          //   duration: Date.now() - startTime,
          // });
        }
        return resp;
      },
    };
  }).filter(Boolean);
}
