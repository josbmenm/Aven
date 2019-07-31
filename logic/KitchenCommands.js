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
  DitchCup: {
    subsystem: 'FillSystem',
    pulse: ['DitchCup'],
    checkReady: kitchenState => {
      if (!kitchenState) {
        return false;
      }
      return kitchenState.FillSystem_DitchCupReady_READ;
    },
  },
  DeliveryDropCup: {
    subsystem: 'Delivery',
    pulse: ['DropCup'],
    checkReady: kitchenState => {
      if (!kitchenState) {
        return false;
      }
      return kitchenState.Delivery_DropCupReady_READ;
    },
  },
  Blend: {
    subsystem: 'BlendSystem',
    pulse: ['Blend'],
    valueParamNames: {
      BlendDuration: 'duration',
    },
    checkReady: kitchenState => {
      if (!kitchenState) {
        return false;
      }
      return kitchenState.BlendSystem_BlendReady_READ;
    },
  },
  PassToDelivery: {
    subsystem: 'BlendSystem',
    pulse: ['DeliverWithClean'],
    checkReady: kitchenState => {
      if (!kitchenState) {
        return false;
      }
      return kitchenState.BlendSystem_DeliverWithCleanReady_READ;
    },
  },
  PassToDeliveryWithoutClean: {
    subsystem: 'BlendSystem',
    pulse: ['DeliverWithoutClean'],
    checkReady: kitchenState => {
      if (!kitchenState) {
        return false;
      }
      return kitchenState.BlendSystem_DeliverWithoutCleanReady_READ;
    },
  },
  Clean: {
    subsystem: 'BlendSystem',
    pulse: ['CleanOnly'],
    checkReady: kitchenState => {
      if (!kitchenState) {
        return false;
      }
      return kitchenState.BlendSystem_CleanOnlyReady_READ;
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
  PassToBlender: {
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
