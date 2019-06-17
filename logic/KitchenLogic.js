const mapObject = require('fbjs/lib/mapObject');

const COUNT_MAX = 32767;
// This max is because we have experienced: RangeError [ERR_OUT_OF_RANGE] [ERR_OUT_OF_RANGE]: The value of "value" is out of range. It must be >= -32768 and <= 32767. Received 1005538255
let tagCounter = Math.floor(Math.random() * COUNT_MAX);

export function getFreshActionId() {
  tagCounter += 1;
  if (tagCounter > COUNT_MAX) {
    tagCounter = 0;
  }
  return tagCounter;
}

export const objFromCount = (size, keyMapper, valMapper) => {
  const o = {};
  for (let i = 0; i < size; i++) {
    o[keyMapper(i)] = valMapper(i);
  }
  return o;
};

export const getExternalTagName = (tagPrefix, subTagName) =>
  tagPrefix == null ? subTagName : `${tagPrefix}.${subTagName}`;

export const sequencerSystemReadTags = {
  NoFaults: {
    type: 'boolean',
    subTag: 'NoFaults',
  },
  ActionIdStarted: {
    type: 'integer',
    subTag: 'Crumb.ActionIdStarted',
  },
  ActionIdEnded: {
    type: 'integer',
    subTag: 'Crumb.ActionIdEnded',
  },
  NoAlarms: {
    type: 'boolean',
    subTag: 'NoAlarms',
  },
  Homed: {
    type: 'boolean',
    subTag: 'Homed',
  },
  PrgStep: {
    type: 'integer',
    subTag: 'PrgStep',
  },
  WatchDogFrozeAt: {
    type: 'integer',
    subTag: 'WatchDogFrozeAt',
  },
  Fault0: {
    type: 'integer',
    subTag: 'Fault[0]',
  },
  Fault1: {
    type: 'integer',
    subTag: 'Fault[1]',
  },
  Fault2: {
    type: 'integer',
    subTag: 'Fault[2]',
  },
  Fault3: {
    type: 'integer',
    subTag: 'Fault[3]',
  },
};

export const sequencerSystemPulseCommands = {
  Reset: {
    subTag: 'Cmd.Reset.HmiPb',
  },
  Home: {
    subTag: 'Cmd.Home.HmiPb',
  },
};
export const sequencerSystemValueCommands = {
  ActionIdIn: {
    type: 'integer',
    subTag: 'Crumb.ActionIdIn',
  },
};
export const mainSubsystems = {
  IOSystem: {
    tagPrefix: null,
    icon: '🔌',
    faults: {},
    readTags: {
      // ...objFromCount(
      //   32,
      //   i => `PLC_1_Output${i}`,
      //   i => ({
      //     type: 'boolean',
      //     subTag: `Local:1:I.ReadBack.${i}`,
      //   }),
      // ),
      // ...objFromCount(
      //   32,
      //   i => `PLC_2_Input${i}`,
      //   i => ({
      //     type: 'boolean',
      //     subTag: `Local:2:I.Data.${i}`,
      //   }),
      // ),
      // ...objFromCount(
      //   6,
      //   i => `PLC_3_InputA${i}_Value`,
      //   i => ({
      //     type: 'integer',
      //     subTag: `Local:3:I.Ch${i}Data`,
      //   }),
      // ),
      // ...objFromCount(
      //   6,
      //   i => `PLC_3_InputA${i}_Status`,
      //   i => ({
      //     type: 'boolean',
      //     subTag: `Local:3:I.Ch${i}Status`,
      //   }),
      // ),
    },
  },
  System: {
    tagPrefix: '_System',
    icon: '🤖',
    faults: {},
    readTags: {
      PlcBooting: {
        type: 'boolean',
        subTag: 'PlcBooting',
      },
    },
    pulseCommands: {},
  },
};
