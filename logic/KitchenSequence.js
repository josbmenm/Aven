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
      type: 'StartedOrder',
    }),
  },
  {
    // drop cup (fill system)
    getDescription: intent => 'Drop Cup',
    getRestaurantStateIntent: restaurantState => {
      if (restaurantState.fill && restaurantState.fill.requestDrop) {
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
      type: 'DroppedFill',
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
      return 'Deliver filled cup to blender';
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
      command: 'DeliverCupToBlender',
    }),
    getSuccessRestaurantAction: intent => ({
      type: 'DeliveredToBlender',
    }),
  },
];

export function computeNextStep(restaurantState, kitchenConfig, kitchenState) {
  if (!restaurantState || !kitchenConfig || !kitchenState) {
    return null;
  }
  const { isFaulted, isRunning } = checkKitchenState(
    kitchenState,
    kitchenConfig,
  );
  if (isFaulted || isRunning) {
    return null;
  }
  let respCommand = null;
  SEQUENCER_STEPS.find(STEP => {
    const {
      getDescription,
      getRestaurantStateIntent,
      getKitchenStateReady,
      getKitchenCommand,
      getSuccessRestaurantAction,
    } = STEP;
    const intent = getRestaurantStateIntent(restaurantState);
    if (!intent) {
      return;
    }

    if (getKitchenStateReady(kitchenState, intent)) {
      respCommand = {
        description: getDescription(intent),
        perform: async (cloud, onKitchenAction) => {
          const kitchenAction = getKitchenCommand(intent);
          const successRestaurantAction = getSuccessRestaurantAction(intent);
          const resp = await onKitchenAction(kitchenAction);

          await cloud
            .get('RestaurantActionsUnburnt')
            .putTransaction(successRestaurantAction);
          return resp;
        },
      };
      return true;
    }
  });
  return respCommand;
}
