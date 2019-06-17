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
  },
  {
    // drop cup (fill system)
    getDescription: intent => 'Drop Cup',
    getRestaurantStateIntent: restaurantState => {
      if (restaurantState.fill && !!restaurantState.fill.requestedDropTime) {
        return {};
      }
      return null;
    },
    getKitchenStateReady: (kitchenState, intent) => {
      return !!kitchenState && kitchenState.FillSystem_DropCupReady_READ;
    },
    getKitchenCommand: intent => ({
      command: 'DropCup',
    }),
    getSuccessRestaurantAction: () => ({
      type: 'DidDropCup',
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
        !restaurantState.fill ||
        !restaurantState.fill.fillsRemaining ||
        restaurantState.fill.fillsRemaining.length !== 0
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
      if (!restaurantState.blend || restaurantState.blend.blendCompleteTime) {
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
      if (!restaurantState.blend || !restaurantState.blend.blendCompleteTime) {
        return null;
      }
      return {};
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
];

export function computeNextSteps(restaurantState, kitchenConfig, kitchenState) {
  if (!restaurantState || !kitchenConfig || !kitchenState) {
    return null;
  }
  if (kitchenState.isAttached) {
    const { isFaulted, isRunning } = checkKitchenState(
      kitchenState,
      kitchenConfig,
    );
    if (isFaulted || isRunning) {
      return null;
    }
  }
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

    if (
      kitchenState.isAttached &&
      !getKitchenStateReady(kitchenState, intent)
    ) {
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
            .get('RestaurantActionsUnburnt')
            .putTransaction(startingRestaurantAction));
        // await cloud.get('KitchenLog').putTransaction({
        //   type: 'StartKitchenAction',
        //   intent,
        //   command,
        // });
        try {
          resp = await handleCommand(command);
          successRestaurantAction &&
            (await cloud
              .get('RestaurantActionsUnburnt')
              .putTransaction(successRestaurantAction));
          // await cloud.get('KitchenLog').putTransaction({
          //   type: 'CompleteKitchenAction',
          //   intent,
          //   command,
          //   duration: Date.now() - startTime,
          // });
        } catch (e) {
          console.error('Failed to perform command', e);
          failureRestaurantAction &&
            (await cloud
              .get('RestaurantActionsUnburnt')
              .putTransaction(failureRestaurantAction));
          // await cloud.get('KitchenLog').putTransaction({
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
