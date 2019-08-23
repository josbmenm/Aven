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
        (!restaurantState.fill || restaurantState.fill === 'ready')
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
      type: 'DidStartCup',
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
        return { didCompleteTask: !restaurantState.fill.requestedDropRemake };
      }
      if (
        restaurantState.fill &&
        restaurantState.fill !== 'ready' &&
        restaurantState.fill.task &&
        restaurantState.fill.task.deliveryMode === 'drop' &&
        restaurantState.fill.task.skipBlend &&
        restaurantState.fill.fillsRemaining.length === 0
      ) {
        return { didCompleteTask: true };
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
      didCompleteTask: intent.didCompleteTask,
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
        // !kitchenState.System_VanPluggedIn_READ &&
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
    getDescription: ({ amount, system, slot, pretendDispense }) => {
      if (pretendDispense) {
        return `Pretend to Fill Cup ${system}.${slot}x${amount}`;
      }
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
      const intent = {
        ...nextFill,
        pretendDispense: restaurantState.isDryRunning,
      };
      return intent;
    },
    getKitchenStateReady: (kitchenState, intent) => {
      return !!kitchenState && kitchenState.FillSystem_DropCupReady_READ;
    },
    getKitchenCommand: intent => {
      if (intent.pretendDispense) {
        return {
          command: 'PositionToSystemSlot',
          params: intent,
        };
      }
      return {
        command: 'PositionAndDispenseAmount',
        params: intent,
      };
    },
    getSuccessRestaurantAction: intent => ({
      type: intent.pretendDispense ? 'DidPretendFill' : 'DidFill',
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
    // go get ready to deliver cup to blender

    getDescription: () => {
      return 'Go to handoff position';
    },
    getRestaurantStateIntent: restaurantState => {
      if (
        !restaurantState.blend ||
        !restaurantState.fill ||
        !restaurantState.fill.fillsRemaining ||
        restaurantState.fill.moveToBlenderTime ||
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
        !!kitchenState && kitchenState.FillPositioner_GoToPositionReady_READ
      );
    },
    getKitchenCommand: intent => ({
      command: 'FillGoToHandoff',
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
          didCompleteTask: false,
        };
      }
      if (
        restaurantState.fill &&
        restaurantState.fill !== 'ready' &&
        restaurantState.fill.task.skipBlend &&
        restaurantState.fill.task.deliveryMode === 'ditch' &&
        restaurantState.fill.fillsRemaining.length === 0
      ) {
        return {
          didCompleteTask: true,
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
      didCompleteTask: intent.didCompleteTask,
    }),
  },

  {
    // prepare pickup cup
    getDescription: intent => 'Go to cup position',
    getRestaurantStateIntent: restaurantState => {
      if (restaurantState.queue && restaurantState.queue.length) {
        return null;
      }
      if (restaurantState.fill == null) {
        return {};
      }
      return null;
    },
    getKitchenStateReady: (kitchenState, intent) => {
      return (
        !!kitchenState && kitchenState.FillPositioner_GoToPositionReady_READ
      );
    },
    getKitchenCommand: intent => ({
      command: 'FillGoToCup',
    }),
    getSuccessRestaurantAction: intent => ({
      type: 'DidFillGoToCup',
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
    const isKitchenReady = getKitchenStateReady(kitchenState, intent);
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
      isKitchenReady,
      successRestaurantAction,
      failureRestaurantAction,
      startingRestaurantAction,
      subsystem: command.subsystem,
      description: getDescription(intent),
      perform: async (onDispatcherAction, kitchenCommand) => {
        let resp = null;
        startingRestaurantAction &&
          (await onDispatcherAction(startingRestaurantAction));
        try {
          resp = await kitchenCommand(command);
          successRestaurantAction &&
            (await onDispatcherAction(successRestaurantAction));
          await delay(30);
        } catch (e) {
          console.error('Failed to perform command', e);
          failureRestaurantAction &&
            (await onDispatcherAction(failureRestaurantAction));
        }
        return resp;
      },
      performFake: async (onDispatcherAction, kitchenCommand) => {
        startingRestaurantAction &&
          (await onDispatcherAction(startingRestaurantAction));
        await delay(1000);
        successRestaurantAction &&
          (await onDispatcherAction(successRestaurantAction));
        await delay(30);

        return null;
      },
    };
  }).filter(Boolean);
}
