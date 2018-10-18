const { Controller, Tag, EthernetIP, TagGroup } = require('ethernet-ip');
const { INT, BOOL } = EthernetIP.CIP.DataTypes.Types;

const mainPLC = new Controller();

let readyPLC = null;
let readyHandlers = new Set();

export const waitForConnection = () => {
  if (readyPLC) {
    return;
  }
  return new Promise((resolve, reject) => {
    readyHandlers.add(resolve),
      setTimeout(
        () => reject(new Error('Timeout while connecting to PLC')),
        5000,
      );
  });
};

const PLC_IP = '192.168.1.122';
mainPLC
  .connect(
    PLC_IP,
    0,
  )
  .then(async () => {
    console.log(
      'PLC Connected. (' + mainPLC.properties.name + ' at ' + PLC_IP + ')',
    );
    readyPLC = mainPLC;
    Array.from(readyHandlers).forEach(h => h());
  })
  .catch(err => {
    console.error('PLC Connection error!');
    console.error(err);
    throw err;
  });

export const getReadyPLC = async () => {
  await waitForConnection();
  if (!readyPLC) {
    throw new Error('PLC not ready!');
  }
  return readyPLC;
};

const getTypeOfSchema = typeName => {
  switch (typeName) {
    case 'boolean':
      return BOOL;
    case 'integer':
      return INT;
    default: {
      throw new Error(`Invalid type name "${typeName}"`);
    }
  }
};

const getTagOfSchema = tagSchema => {
  return new Tag(
    tagSchema.tag,
    tagSchema.program,
    getTypeOfSchema(tagSchema.type),
  );
};

export const createSchema = controllerSchema => {
  const tags = {};
  const allTagsGroup = new TagGroup();
  Object.keys(controllerSchema).forEach(tagAlias => {
    tags[tagAlias] = getTagOfSchema(controllerSchema[tagAlias]);
    allTagsGroup.add(tags[tagAlias]);
  });
  return { config: controllerSchema, tags, allTagsGroup };
};

const getExternalTagName = (systemPrefix, subTagName) =>
  systemPrefix == null ? subTagName : `${systemPrefix}.${subTagName}`;

const subsystems = {};
const createSubSystem = (systemName, systemPrefix, systemConfig) => {
  const { readTags, icon, pulseCommands, valueCommands } = systemConfig;
  const extractActionValues = ({ pulse, values }) => {
    const pulseCommands = systemConfig.pulseCommands || {};
    const valueCommands = systemConfig.valueCommands || {};
    const immediateOutput = {};
    const clearPulseOutput = {};
    pulse.forEach(pulseName => {
      const pulseSpec = pulseCommands[pulseName];
      if (!pulseSpec) {
        throw new Error('Invalid pulse type!');
      }
      const internalTagName = `${systemName}_${pulseName}_PULSE`;
      immediateOutput[internalTagName] = true;
      clearPulseOutput[internalTagName] = false;
    });
    Object.keys(values).forEach(valueName => {
      const valueSpec = valueCommands[valueName];
      if (!valueSpec) {
        throw new Error('Invalid value name: ' + valueName);
      }
      const internalTagName = `${systemName}_${valueName}_VALUE`;
      immediateOutput[internalTagName] = values[valueName];
    });
    return { immediateOutput, clearPulseOutput };
  };

  subsystems[systemName] = {
    extractActionValues,
    systemPrefix,
    readTags,
    pulseCommands,
    valueCommands,
    icon,
  };
};
const genericSystemReadTags = {
  NoFaults: {
    type: 'boolean',
    subTag: 'NoFaults',
  },
  NoAlarms: {
    type: 'boolean',
    subTag: 'NoAlarms',
  },
  PrgStep: {
    type: 'integer',
    subTag: 'PrgStep',
  },
};

const objFromCount = (size, keyMapper, valMapper) => {
  const o = {};
  for (let i = 0; i < size; i++) {
    o[keyMapper(i)] = valMapper(i);
  }
  return o;
};

createSubSystem('IOSystem', null, {
  icon: '🔌',
  readTags: {
    ...objFromCount(
      8,
      i => `PLC_1_Output${i}`,
      i => ({
        type: 'boolean',
        subTag: `Local:1:I.ReadBack.${i}`,
      }),
    ),
    ...objFromCount(
      8,
      i => `PLC_2_Input${i}`,
      i => ({
        type: 'boolean',
        subTag: `Local:2:I.Data.${i}`,
      }),
    ),
    ...objFromCount(
      6,
      i => `PLC_3_InputA${i}_Value`,
      i => ({
        type: 'integer',
        subTag: `Local:3:I.Ch${i}Data`,
      }),
    ),
    ...objFromCount(
      6,
      i => `PLC_3_InputA${i}_Status`,
      i => ({
        type: 'boolean',
        subTag: `Local:3:I.Ch${i}Status`,
      }),
    ),
  },
});
createSubSystem('System', '_System', {
  icon: '🤖',
  readTags: {
    PlcBooting: {
      type: 'boolean',
      subTag: 'PlcBooting',
    },
  },
  pulseCommands: {
    Reset: {
      subTag: 'systemResetPls',
    },
  },
});
createSubSystem('Granule0', '_Granule0', {
  icon: '🍚',
  readTags: { ...genericSystemReadTags },
});
createSubSystem('FillPositioner', '_FillPositioner', {
  icon: '↔️',
  readTags: {
    ...genericSystemReadTags,
    Homed: {
      subTag: 'Homed',
      type: 'boolean',
    },
    HomeLimitSwitched: {
      subTag: 'HomeLimitSwitched.SensorOn',
      type: 'boolean',
    },
    InputMotorReady: {
      subTag: 'InputMotorReady',
      type: 'boolean',
    },
    OutputMotorEnabled: {
      subTag: 'OutputMotorEnabled',
      type: 'boolean',
    },
    OutputMotorDirection: {
      subTag: 'OutputMotorDirection',
      type: 'boolean',
    },
  },
  pulseCommands: {
    Home: {
      subTag: 'Cmd.Home.HmiPb',
    },
    GoToPosition: {
      subTag: 'Cmd.GoToPosition.HmiPb',
    },
  },
  valueCommands: {
    Dest: {
      type: 'integer',
      subTag: 'Cmd.GoToPositionDest',
    },
  },
});

const generateSubsystemTags = subsystems => {
  const schemaConfig = {};
  Object.keys(subsystems).forEach(subsystemName => {
    const subsystem = subsystems[subsystemName];
    Object.keys(subsystem.readTags).forEach(readTagName => {
      const internalTagName = `${subsystemName}_${readTagName}_READ`;
      const readTagSpec = subsystem.readTags[readTagName];
      schemaConfig[internalTagName] = {
        type: readTagSpec.type,
        tag: getExternalTagName(subsystem.systemPrefix, readTagSpec.subTag),
        enableOutput: false,
      };
    });
    console.log('dude!!', subsystem.pulseCommands);
    Object.keys(subsystem.pulseCommands || {}).forEach(pulseCommandName => {
      console.log('CONFIG', pulseCommandName);
      const internalTagName = `${subsystemName}_${pulseCommandName}_PULSE`;
      const pulseCommandSpec = subsystem.pulseCommands[pulseCommandName];
      schemaConfig[internalTagName] = {
        type: 'boolean',
        tag: getExternalTagName(
          subsystem.systemPrefix,
          pulseCommandSpec.subTag,
        ),
        enableOutput: true,
      };
    });
    Object.keys(subsystem.valueCommands || {}).forEach(valueCommandName => {
      const internalTagName = `${subsystemName}_${valueCommandName}_VALUE`;
      const valueCommandSpec = subsystem.valueCommands[valueCommandName];
      schemaConfig[internalTagName] = {
        type: valueCommandSpec.type,
        tag: getExternalTagName(
          subsystem.systemPrefix,
          valueCommandSpec.subTag,
        ),
        enableOutput: true,
      };
    });
  });

  return schemaConfig;
};
console.log('ok', generateSubsystemTags(subsystems));
const mainRobotSchema = createSchema({
  ...generateSubsystemTags(subsystems),

  systemResetPls: {
    tag: '_System.SystemResetPls',
    type: 'boolean',
    enableOutput: true,
  },
});

export const readTags = async (schema, action) => {
  const PLC = await getReadyPLC();
  try {
    await PLC.readTagGroup(schema.allTagsGroup);
  } catch (e) {
    console.log('Error Reading Tags!', e);
  }

  const readings = {};

  Object.keys(schema.config).forEach(tagAlias => {
    readings[tagAlias] = {
      ...schema.config[tagAlias],
      value: schema.tags[tagAlias].value,
    };
  });
  return readings;
};

export const writeTags = async (schema, values) => {
  const outputGroup = new TagGroup();
  const controllerSchema = schema.config;
  Object.keys(values).forEach(tagAlias => {
    if (
      !controllerSchema[tagAlias] ||
      !controllerSchema[tagAlias].enableOutput
    ) {
      throw new Error(`Output is not configured for "${tagAlias}"`);
    }
    const tag = schema.tags[tagAlias];
    tag.value = values[tagAlias];
    outputGroup.add(tag);
  });

  const PLC = await getReadyPLC();
  await PLC.writeTagGroup(outputGroup);
};

const shallowEqual = require('fbjs/lib/shallowEqual');
const mapObject = require('fbjs/lib/mapObject');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const pulseOutput = async tagName => {
  await writeTags(mainRobotSchema, { [tagName]: true });
  await delay(500);
  await writeTags(mainRobotSchema, { [tagName]: false });
};
let currentState;

const getTagValues = tags => mapObject(tags, tag => tag.value);

const updateTags = async () => {
  const lastState = currentState;
  currentState = getTagValues(await readTags(mainRobotSchema, {}));
  if (shallowEqual(lastState, currentState)) {
    await delay(500);
    return;
  }
  console.log('state has changed!', currentState);
  await delay(200);
};
const updateTagsForever = () => {
  updateTags()
    .then(async () => {
      updateTagsForever();
    })
    .catch(console.error);
};

updateTagsForever();

export const kitchenDispatch = async action => {
  switch (action.type) {
    case 'writeTags':
      return await writeTags(mainRobotSchema, action.values);
    // case 'readTags':
    //   return await readTags(mainRobotSchema, action);
    case 'kitchenReset': {
      await pulseOutput('systemResetPls');
      return {};
    }
    case 'kitchenAction': {
      const subsystem = subsystems[action.subsystem];
      const {
        immediateOutput,
        clearPulseOutput,
      } = subsystem.extractActionValues({
        pulse: action.pulse,
        values: action.values,
      });
      console.log('woah', immediateOutput, clearPulseOutput);
      await writeTags(mainRobotSchema, immediateOutput);
      await delay(500);
      await writeTags(mainRobotSchema, clearPulseOutput);
      return { ...immediateOutput, ...clearPulseOutput };
    }
    case 'getState':
      return currentState;
    default:
      throw `Unknown action type "${action.type}"`;
  }
};
