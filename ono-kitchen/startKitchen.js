const { Controller, Tag, EthernetIP, TagGroup } = require('ethernet-ip');
const { INT, BOOL } = EthernetIP.CIP.DataTypes.Types;

const shallowEqual = require('fbjs/lib/shallowEqual');
const mapObject = require('fbjs/lib/mapObject');

export default function startKitchen({ client, plcIP }) {
  const mainPLC = new Controller();

  let readyPLC = null;
  let readyHandlers = new Set();

  let hasClosed = false;

  const waitForConnection = () => {
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

  mainPLC
    .connect(
      plcIP,
      0,
    )
    .then(async () => {
      if (hasClosed) {
        mainPLC.destroy();
        return;
      }
      console.log(
        'PLC Connected. (' + mainPLC.properties.name + ' at ' + plcIP + ')',
      );
      readyPLC = mainPLC;
      Array.from(readyHandlers).forEach(h => h());
    })
    .catch(err => {
      console.error('PLC Connection error!');
      console.error(err);
      throw err;
    });

  const getReadyPLC = async () => {
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

  const createSchema = subsystems => {
    const robotTags = {};
    Object.keys(subsystems).forEach(subsystemName => {
      const subsystem = subsystems[subsystemName];
      Object.keys(subsystem.readTags).forEach(readTagName => {
        const internalTagName = `${subsystemName}_${readTagName}_READ`;
        const readTagSpec = subsystem.readTags[readTagName];
        robotTags[internalTagName] = {
          subSystem: subsystemName,
          name: internalTagName,
          type: readTagSpec.type,
          tag: getExternalTagName(subsystem.systemPrefix, readTagSpec.subTag),
          enableOutput: false,
        };
      });
      Object.keys(subsystem.pulseCommands || {}).forEach(pulseCommandName => {
        const internalTagName = `${subsystemName}_${pulseCommandName}_PULSE`;
        const pulseCommandSpec = subsystem.pulseCommands[pulseCommandName];
        robotTags[internalTagName] = {
          subSystem: subsystemName,
          name: pulseCommandName,
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
        robotTags[internalTagName] = {
          subSystem: subsystemName,
          name: valueCommandName,
          type: valueCommandSpec.type,
          tag: getExternalTagName(
            subsystem.systemPrefix,
            valueCommandSpec.subTag,
          ),
          enableOutput: true,
        };
      });
    });

    const tags = {};
    const allTagsGroup = new TagGroup();
    Object.keys(robotTags).forEach(tagAlias => {
      tags[tagAlias] = getTagOfSchema(robotTags[tagAlias]);
      allTagsGroup.add(tags[tagAlias]);
    });
    return { config: { subsystems, tags: robotTags }, tags, allTagsGroup };
  };

  const getExternalTagName = (systemPrefix, subTagName) =>
    systemPrefix == null ? subTagName : `${systemPrefix}.${subTagName}`;

  const subsystems = {};
  const createSubSystem = (systemName, systemPrefix, subSystemConfig) => {
    const { readTags, icon } = subSystemConfig;
    const pulseCommands = subSystemConfig.pulseCommands || {};
    const valueCommands = subSystemConfig.valueCommands || {};
    const extractActionValues = ({ pulse, values }) => {
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
    WatchDogFrozeAt: {
      type: 'integer',
      subTag: 'WatchDogFrozeAt',
    },
    Fault0: {
      type: 'integer',
      subTag: 'Fault[0]',
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
        32,
        i => `PLC_1_Output${i}`,
        i => ({
          type: 'boolean',
          subTag: `Local:1:I.ReadBack.${i}`,
        }),
      ),
      ...objFromCount(
        32,
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

  const genericSystemPulseCommands = {
    Reset: {
      subTag: 'Cmd.Reset.HmiPb',
    },
    Home: {
      subTag: 'Cmd.Home.HmiPb',
    },
  };

  createSubSystem('System', '_System', {
    icon: '🤖',
    readTags: {
      PlcBooting: {
        type: 'boolean',
        subTag: 'PlcBooting',
      },
    },
    pulseCommands: {
      ...genericSystemPulseCommands,
    },
  });

  createSubSystem('Granule', '_Granule', {
    icon: '🍚',
    readTags: {
      ...genericSystemReadTags,
      SlotToDispense: {
        subTag: 'SlotToDispense',
        type: 'integer',
      },
      DispenseCountGoal: {
        subTag: 'DispenseCountGoal',
        type: 'integer',
      },
      DispenseCountSoFar: {
        subTag: 'DispenseCountSoFar',
        type: 'integer',
      },
    },
    pulseCommands: {
      ...genericSystemPulseCommands,
      DispenseAmount: {
        subTag: 'Cmd.DispenseAmount.HmiPb',
      },
    },
    valueCommands: {
      AmountToDispense: {
        type: 'integer',
        subTag: 'Cmd.AmountToDispense',
      },
    },
  });

  createSubSystem('Piston', '_Piston', {
    icon: '💩',
    readTags: {
      ...genericSystemReadTags,
      DispenseCountGoal: {
        subTag: 'DispenseCountGoal',
        type: 'integer',
      },
      DispenseCountSoFar: {
        subTag: 'DispenseCountSoFar',
        type: 'integer',
      },
    },
    pulseCommands: {
      ...genericSystemPulseCommands,
      DispenseAmount: {
        subTag: 'Cmd.DispenseAmount.HmiPb',
      },
    },
    valueCommands: {
      AmountToDispense: {
        type: 'integer',
        subTag: 'Cmd.AmountToDispense',
      },
    },
  });

  createSubSystem('FillSystem', '_FillSystem', {
    icon: '🥙',
    readTags: {
      ...genericSystemReadTags,
      Homed: {
        subTag: 'Homed',
        type: 'boolean',
      },
    },
    pulseCommands: {
      ...genericSystemPulseCommands,
      PositionAndDispenseAmount: {
        subTag: 'Cmd.PositionAndDispenseAmount.HmiPb',
      },
    },
    valueCommands: {
      AmountToDispense: {
        type: 'integer',
        subTag: 'Cmd.AmountToDispense',
      },
      SlotToDispense: {
        type: 'integer',
        subTag: 'Cmd.SlotToDispense',
      },
    },
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
      PositionDest: {
        subTag: 'PositionDest',
        type: 'integer',
      },
    },
    pulseCommands: {
      ...genericSystemPulseCommands,
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

  const mainRobotSchema = createSchema(subsystems);

  const readTags = async (schema, action) => {
    const PLC = await getReadyPLC();
    try {
      await PLC.readTagGroup(schema.allTagsGroup);
    } catch (e) {
      console.log('Error Reading Tags!', e);
      process.exit(1);
    }

    const readings = {};

    Object.keys(schema.config.tags).forEach(tagAlias => {
      readings[tagAlias] = {
        ...schema.config.tags[tagAlias],
        value: schema.tags[tagAlias].value,
      };
    });
    return readings;
  };

  const writeTags = async (schema, values) => {
    const outputGroup = new TagGroup();
    const robotTags = schema.config.tags;
    Object.keys(values).forEach(tagAlias => {
      if (!robotTags[tagAlias] || !robotTags[tagAlias].enableOutput) {
        throw new Error(`Output is not configured for "${tagAlias}"`);
      }
      const tag = schema.tags[tagAlias];
      tag.value = values[tagAlias];
      outputGroup.add(tag);
    });

    const PLC = await getReadyPLC();
    await PLC.writeTagGroup(outputGroup);
  };

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  async function connectKitchenClient() {
    const configRef = client.getRef('KitchenConfig');
    const stateRef = client.getRef('KitchenState');
    await configRef.put(mainRobotSchema.config);

    let currentState;
    const getTagValues = tags => mapObject(tags, tag => tag.value);
    const updateTags = async () => {
      const lastState = currentState;
      currentState = getTagValues(await readTags(mainRobotSchema, {}));
      if (shallowEqual(lastState, currentState)) {
        await delay(500);
        return;
      }
      await stateRef.put(currentState);
      await delay(200);
    };
    const updateTagsForever = () => {
      if (hasClosed) {
        return;
      }
      updateTags()
        .then(async () => {
          updateTagsForever();
        })
        .catch(console.error);
    };
    updateTagsForever();
  }

  async function dispatchCommand(action) {
    const subsystem = subsystems[action.subsystem];
    const { immediateOutput, clearPulseOutput } = subsystem.extractActionValues(
      {
        pulse: action.pulse,
        values: action.values,
      },
    );
    await writeTags(mainRobotSchema, immediateOutput);
    await delay(500);
    await writeTags(mainRobotSchema, clearPulseOutput);
    return { ...immediateOutput, ...clearPulseOutput };
  }

  function close() {
    readyPLC && readyPLC.destroy();
    readyPLC = null;
    hasClosed = true;
  }

  connectKitchenClient()
    .then(() => {})
    .catch(e => {
      console.error(e);
      process.exit();
    });

  return {
    close,
    dispatchCommand,
  };
}
