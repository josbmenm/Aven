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
  FillWaterTank: {
    subsystem: 'FillSystem',
    pulse: ['FillWaterTank'],
    values: {},
    checkReady: kitchenState => {
      return kitchenState.FillSystem_FillWaterTankReady_READ;
    },
  },
  DispenseCup: {
    subsystem: 'Denester',
    pulse: ['DispenseAmount'],
    values: {},
    checkReady: kitchenState => {
      return kitchenState.Denester_DispenseAmountReady_READ;
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
    subsystem: 'FillSystem',
    pulse: ['PositionOnly'],
    values: {
      DispenseSystem: 5,
      SlotToDispense: 0,
    },
    checkReady: kitchenState => {
      return kitchenState.FillSystem_PositionOnlyReady_READ;
    },
  },
  FillGoToHandoff: {
    subsystem: 'FillPositioner',
    pulse: ['GoToPosition'],
    values: {
      PositionDest: 199710, // this value will be used as a fallback! it will generally be determined by the position param
    },
    valueParamNames: {
      PositionDest: 'position',
    },
    checkReady: kitchenState => {
      return kitchenState.FillPositioner_GoToPositionReady_READ;
    },
  },
  Blend: {
    subsystem: 'BlendSystem',
    pulse: ['Blend'],
    valueParamNames: {
      Timer1: 'Timer1',
      Speed1: 'Speed1',
      Pulse1: 'Pulse1',
      Timer2: 'Timer2',
      Speed2: 'Speed2',
      Pulse2: 'Pulse2',
      Timer3: 'Timer3',
      Speed3: 'Speed3',
      Pulse3: 'Pulse3',
      Timer4: 'Timer4',
      Speed4: 'Speed4',
      Pulse4: 'Pulse4',
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
  RetractArm: {
    subsystem: 'BlendSystem',
    pulse: ['RetractArm'],
    checkReady: kitchenState => {
      return kitchenState.BlendSystem_RetractArmReady_READ;
    },
  },
  ExtendArm: {
    subsystem: 'BlendSystem',
    pulse: ['ExtendArm'],
    checkReady: kitchenState => {
      return kitchenState.BlendSystem_ExtendArmReady_READ;
    },
  },
  LowerBlenderElevator: {
    subsystem: 'BlendSystem',
    pulse: ['LowerBlenderElevator'],
    checkReady: kitchenState => {
      return kitchenState.BlendSystem_LowerBlenderElevatorReady_READ;
    },
  },
  LiftBlenderElevator: {
    subsystem: 'BlendSystem',
    pulse: ['LiftBlenderElevator'],
    checkReady: kitchenState => {
      return kitchenState.BlendSystem_LiftBlenderElevatorReady_READ;
    },
  },
  FlipCupPlate: {
    subsystem: 'BlendSystem',
    pulse: ['FlipCupPlate'],
    checkReady: kitchenState => {
      return kitchenState.BlendSystem_FlipCupPlateReady_READ;
    },
  },
  ReturnCupPlate: {
    subsystem: 'BlendSystem',
    pulse: ['ReturnCupPlate'],
    checkReady: kitchenState => {
      return kitchenState.BlendSystem_ReturnCupPlateReady_READ;
    },
  },
  FlipBladePlate: {
    subsystem: 'BlendSystem',
    pulse: ['FlipBladePlate'],
    checkReady: kitchenState => {
      return kitchenState.BlendSystem_FlipBladePlateReady_READ;
    },
  },
  ReturnBladePlate: {
    subsystem: 'BlendSystem',
    pulse: ['ReturnBladePlate'],
    checkReady: kitchenState => {
      return kitchenState.BlendSystem_ReturnBladePlateReady_READ;
    },
  },
  BeveragePurgeAll: {
    subsystem: 'Beverage',
    pulse: ['PurgeAll'],
    checkReady: kitchenState => {
      return kitchenState.Beverage_PurgeAllReady_READ;
    },
  },
  BeverageStopPurgeAll: {
    subsystem: 'Beverage',
    pulse: ['StopPurgeAll'],
    checkReady: kitchenState => {
      return kitchenState.Beverage_StopPurgeAllReady_READ;
    },
  },
  FrozenPurgeAll: {
    subsystem: 'FrozenFood',
    pulse: ['PurgeAll'],
    checkReady: kitchenState => {
      return kitchenState.FrozenFood_PurgeAllReady_READ;
    },
  },
  FrozenVibrateAll: {
    subsystem: 'FrozenFood',
    pulse: ['VibrateAll'],
    checkReady: kitchenState => {
      return kitchenState.FrozenFood_VibrateAllReady_READ;
    },
  },
  FrozenStopVibrateAll: {
    subsystem: 'FrozenFood',
    pulse: ['StopVibrateAll'],
    checkReady: kitchenState => {
      return true;
      // return kitchenState.FrozenFood_StopVibrateAllReady_READ;
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
    checkReady: (kitchenState, commandParams) => {
      // todo, check the slot for errors!
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
