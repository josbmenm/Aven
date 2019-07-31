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
  Alarm0: {
    type: 'integer',
    subTag: 'Alarm[0]',
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

export function companyConfigToKitchenConfig(companyConfig) {
  if (!companyConfig) {
    return null;
  }
  const {
    KitchenSystems,
    KitchenSystemTags,
    KitchenSystemFaults,
    KitchenSystemAlarms,
  } = companyConfig.baseTables;
  if (!KitchenSystems) {
    return null;
  }

  const subsystems = {
    ...mainSubsystems,
  };
  Object.keys(KitchenSystems).forEach(kitchenSystemId => {
    const kitchenSystem = KitchenSystems[kitchenSystemId];
    const tags = Object.values(KitchenSystemTags).filter(tag => {
      return tag.System[0] === kitchenSystemId;
    });
    const systemFaults = Object.values(KitchenSystemFaults).filter(
      f => f.System[0] === kitchenSystemId,
    );
    const faults = systemFaults.map(faultRow => ({
      description: faultRow.Name,
      bitIndex: faultRow['Fault Bit'],
      intIndex: faultRow['Fault Integer'],
    }));
    const systemAlarms = Object.values(KitchenSystemAlarms).filter(
      a => a.System[0] === kitchenSystemId,
    );
    const alarms = systemAlarms.map(row => ({
      description: row.Name,
      bitIndex: row['Alarm Bit'],
      intIndex: row['Alarm Integer'],
    }));
    const readTags = {
      ...((kitchenSystem.HasSequencer && sequencerSystemReadTags) || {}),
    };
    const pulseCommands = {
      ...((kitchenSystem.HasSequencer && sequencerSystemPulseCommands) || {}),
    };
    const valueCommands = {
      ...((kitchenSystem.HasSequencer && sequencerSystemValueCommands) || {}),
    };
    tags.forEach(tag => {
      if (tag.Type === 'Command DINT') {
        valueCommands[tag['Internal Name']] = {
          name: tag['Internal Name'],
          type: 'integer',
          subTag: tag['PLC Sub-Tag'],
        };
      } else if (tag.Type === 'Command BOOL') {
        valueCommands[tag['Internal Name']] = {
          name: tag['Internal Name'],
          type: 'boolean',
          subTag: tag['PLC Sub-Tag'],
        };
      } else if (tag.Type === 'Read DINT') {
        readTags[tag['Internal Name']] = {
          name: tag['Internal Name'],
          type: 'integer',
          subTag: tag['PLC Sub-Tag'],
        };
      } else if (tag.Type === 'Read BOOL') {
        readTags[tag['Internal Name']] = {
          name: tag['Internal Name'],
          type: 'boolean',
          subTag: tag['PLC Sub-Tag'],
        };
      } else if (tag.Type === 'Command Pulse BOOL') {
        pulseCommands[tag['Internal Name']] = {
          subTag: tag['PLC Sub-Tag'],
          name: tag['Internal Name'],
          params:
            tag['PulseParameterTags'] &&
            tag['PulseParameterTags']
              .map(atId => {
                return tags.find(t => t.id === atId);
              })
              .map(tag => tag['Internal Name']),
        };
      } else {
        // throw new Error(`Unexpected tag type "${tag.Type}"`);
      }
    });
    subsystems[kitchenSystem.Name] = {
      tagPrefix: kitchenSystem['PLC System Name'],
      icon: kitchenSystem.Icon,
      readTags,
      valueCommands,
      pulseCommands,
      faults,
      alarms,
      hasSequencer: kitchenSystem.HasSequencer,
      name: kitchenSystem.Name,
    };
  });

  const tags = {};
  Object.keys(subsystems).forEach(subsystemName => {
    const subsystem = subsystems[subsystemName];
    Object.keys(subsystem.readTags).forEach(readTagName => {
      const internalTagName = `${subsystemName}_${readTagName}_READ`;
      const readTagSpec = subsystem.readTags[readTagName];
      tags[internalTagName] = {
        subSystem: subsystemName,
        name: internalTagName,
        type: readTagSpec.type,
        tag: getExternalTagName(subsystem.tagPrefix, readTagSpec.subTag),
        enableOutput: false,
      };
    });
    Object.keys(subsystem.pulseCommands || {}).forEach(pulseCommandName => {
      const internalTagName = `${subsystemName}_${pulseCommandName}_PULSE`;
      const pulseCommandSpec = subsystem.pulseCommands[pulseCommandName];
      tags[internalTagName] = {
        subSystem: subsystemName,
        name: pulseCommandName,
        type: 'boolean',
        tag: getExternalTagName(subsystem.tagPrefix, pulseCommandSpec.subTag),
        enableOutput: true,
      };
    });
    Object.keys(subsystem.valueCommands || {}).forEach(valueCommandName => {
      const internalTagName = `${subsystemName}_${valueCommandName}_VALUE`;
      const valueCommandSpec = subsystem.valueCommands[valueCommandName];
      tags[internalTagName] = {
        subSystem: subsystemName,
        name: valueCommandName,
        type: valueCommandSpec.type,
        tag: getExternalTagName(subsystem.tagPrefix, valueCommandSpec.subTag),
        enableOutput: true,
      };
    });
  });

  return { subsystems, tags };
}
