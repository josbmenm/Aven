const KitchenCommands = {
  Home: {
    subsystem: 'FillSystem',
    pulse: ['Home'],
    checkReady: () => true,
  },
  GetCup: {
    subsystem: 'FillSystem',
    pulse: ['PickUpNewCup'],
    values: {},
    checkReady: kitchenState => {
      if (!kitchenState) {
        return false;
      }
      return kitchenState.FillSystem_PickUpNewCupReady_READ;
    },
  },
  DropCup: {
    subsystem: 'FillSystem',
    pulse: ['DropCup'],
    checkReady: kitchenState => {
      if (!kitchenState) {
        return false;
      }
      return kitchenState.FillSystem_DropCupReady_READ;
    },
  },
  PositionAndDispenseAmount: {
    subsystem: 'FillSystem',
    pulse: ['PositionAndDispenseAmount'],
    valueParamNames: {
      DispenseAmount: 'amount',
      DispenseSystem: 'system',
      SlotToDispense: 'slot',
    },
    checkReady: kitchenState => {
      if (!kitchenState) {
        return false;
      }
      return kitchenState.FillSystem_PositionAndDispenseAmountReady_READ;
    },
  },
  DeliverCupToBlender: {
    subsystem: 'FillSystem',
    pulse: ['DeliverToBlender'],
    checkReady: kitchenState => {
      if (!kitchenState) {
        return false;
      }
      return kitchenState.FillSystem_DeliverToBlenderReady_READ;
    },
  },
};

export default KitchenCommands;