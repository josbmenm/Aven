const KitchenCommands = {
  Home: {
    subsystem: 'FillSystem',
    pulse: ['Home'],
    checkReady: kitchenState => {
      return kitchenState.FillSystem_PrgStep_READ === 0;
    },
  },
  GetCup: {
    subsystem: 'FillSystem',
    pulse: ['PickUpNewCup'],
    values: {},
    checkReady: kitchenState => {
      return kitchenState.FillSystem_PickUpNewCupReady_READ;
    },
  },

  DispenseCup: {
    subsystem: 'Denester',
    pulse: ['DispenseAmount'],
    values: {},
    checkReady: kitchenState => {
      return kitchenState.Denester_DispenseAmount_READ;
    },
  },
  DispenseOnly: {
    subsystem: 'FillSystem',
    pulse: ['DispenseAmountSystem'],
    valueParamNames: {
      DispenseAmount: 'amount',
      DispenseSystem: 'system',
      SlotToDispense: 'slot',
    },
    checkReady: kitchenState => {
      return kitchenState.FillSystem_DispenseAmountReady_READ;
    },
  },
  EnterServiceMode: {
    subsystem: 'FillSystem',
    pulse: ['EnterServiceMode'],
    checkReady: kitchenState => {
      return kitchenState.FillSystem_EnterServiceModeReady_READ;
    },
  },
  DeliverBay0: {
    subsystem: 'Delivery',
    pulse: ['DeliverBay0'],
    checkReady: kitchenState => {
      return kitchenState.Delivery_DeliverBay0Ready_READ;
    },
  },
  DeliverBay1: {
    subsystem: 'Delivery',
    pulse: ['DeliverBay1'],
    checkReady: kitchenState => {
      return kitchenState.Delivery_DeliverBay1Ready_READ;
    },
  },

  // PrepareForBlender: {
  //   subsystem: 'FillPositioner',
  //   pulse: ['GoToPosition'],
  //   values:
  //   checkReady: kitchenState => {
  //     if (!kitchenState) {
  //       return false;
  //     }
  //     return kitchenState.FillPositioner_GoToPosition_READ && FillSystem_PrgStep_READ === 0;
  //   },
  // },
  // PrepareForNewCup: {
  //   system: 'FillPositioner',
  //   pulse: ['GoToPosition'],
  //   values: {}
  // },
  DropCup: {
    subsystem: 'FillSystem',
    pulse: ['DropCup'],
    checkReady: kitchenState => {
      return kitchenState.FillSystem_DropCupReady_READ;
    },
  },
  DitchCup: {
    subsystem: 'FillSystem',
    pulse: ['DitchCup'],
    checkReady: kitchenState => {
      return kitchenState.FillSystem_DitchCupReady_READ;
    },
  },
  DeliveryDropCup: {
    subsystem: 'Delivery',
    pulse: ['DropCup'],
    checkReady: kitchenState => {
      return kitchenState.Delivery_DropCupReady_READ;
    },
  },
  FillGoToCup: {
    subsystem: 'FillPositioner',
    pulse: ['GoToPosition'],
    values: {
      PositionDest: 125,
    },
    checkReady: kitchenState => {
      return kitchenState.FillPositioner_GoToPositionReady_READ;
    },
  },
  FillGoToHandoff: {
    subsystem: 'FillPositioner',
    pulse: ['GoToPosition'],
    values: {
      PositionDest: 66570,
    },
    checkReady: kitchenState => {
      return kitchenState.FillPositioner_GoToPositionReady_READ;
    },
  },
  Blend: {
    subsystem: 'BlendSystem',
    pulse: ['Blend'],
    valueParamNames: {
      BlendDuration: 'duration',
    },
    checkReady: kitchenState => {
      return kitchenState.BlendSystem_BlendReady_READ;
    },
  },
  PassToDelivery: {
    subsystem: 'BlendSystem',
    pulse: ['DeliverWithClean'],
    checkReady: kitchenState => {
      return kitchenState.BlendSystem_DeliverWithCleanReady_READ;
    },
  },
  PassToDeliveryWithoutClean: {
    subsystem: 'BlendSystem',
    pulse: ['DeliverWithoutClean'],
    checkReady: kitchenState => {
      return kitchenState.BlendSystem_DeliverWithoutCleanReady_READ;
    },
  },
  Clean: {
    subsystem: 'BlendSystem',
    pulse: ['CleanOnly'],
    checkReady: kitchenState => {
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
      return kitchenState.FillSystem_PositionAndDispenseAmountReady_READ;
    },
  },
  PositionToSystemSlot: {
    subsystem: 'FillSystem',
    pulse: ['PositionOnly'],
    valueParamNames: {
      DispenseSystem: 'system',
      SlotToDispense: 'slot',
    },
    checkReady: kitchenState => {
      return kitchenState.FillSystem_PositionOnlyReady_READ;
    },
  },
  PassToBlender: {
    subsystem: 'FillSystem',
    pulse: ['DeliverToBlender'],
    checkReady: kitchenState => {
      return kitchenState.FillSystem_DeliverToBlenderReady_READ;
    },
  },
};

export default KitchenCommands;
