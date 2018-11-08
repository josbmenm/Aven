const { Controller, Tag, EthernetIP, TagGroup } = require('ethernet-ip');
const { INT, BOOL } = EthernetIP.CIP.DataTypes.Types;

const shallowEqual = require('fbjs/lib/shallowEqual');
const mapObject = require('fbjs/lib/mapObject');

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

const objFromCount = (size, keyMapper, valMapper) => {
  const o = {};
  for (let i = 0; i < size; i++) {
    o[keyMapper(i)] = valMapper(i);
  }
  return o;
};

const getExternalTagName = (tagPrefix, subTagName) =>
  tagPrefix == null ? subTagName : `${tagPrefix}.${subTagName}`;

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
        tag: getExternalTagName(subsystem.tagPrefix, readTagSpec.subTag),
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
        tag: getExternalTagName(subsystem.tagPrefix, pulseCommandSpec.subTag),
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
        tag: getExternalTagName(subsystem.tagPrefix, valueCommandSpec.subTag),
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

const extractActionValues = ({
  subSystemConfig,
  pulse,
  values,
  systemName,
}) => {
  const pulseCommands = subSystemConfig.pulseCommands || {};
  const valueCommands = subSystemConfig.valueCommands || {};
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

  const genericSystemReadTags = {
    NoFaults: {
      type: 'boolean',
      subTag: 'NoFaults',
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
  };

  const genericSystemPulseCommands = {
    Reset: {
      subTag: 'Cmd.Reset.HmiPb',
    },
    Home: {
      subTag: 'Cmd.Home.HmiPb',
    },
  };

  // const subsystems = {
  //   IOSystem: {
  //     tagPrefix: null,
  //     icon: '🔌',
  //     readTags: {
  //       ...objFromCount(
  //         32,
  //         i => `PLC_1_Output${i}`,
  //         i => ({
  //           type: 'boolean',
  //           subTag: `Local:1:I.ReadBack.${i}`,
  //         }),
  //       ),
  //       ...objFromCount(
  //         32,
  //         i => `PLC_2_Input${i}`,
  //         i => ({
  //           type: 'boolean',
  //           subTag: `Local:2:I.Data.${i}`,
  //         }),
  //       ),
  //       ...objFromCount(
  //         6,
  //         i => `PLC_3_InputA${i}_Value`,
  //         i => ({
  //           type: 'integer',
  //           subTag: `Local:3:I.Ch${i}Data`,
  //         }),
  //       ),
  //       ...objFromCount(
  //         6,
  //         i => `PLC_3_InputA${i}_Status`,
  //         i => ({
  //           type: 'boolean',
  //           subTag: `Local:3:I.Ch${i}Status`,
  //         }),
  //       ),
  //     },
  //   },
  //   System: {
  //     tagPrefix: '_System',
  //     icon: '🤖',
  //     readTags: {
  //       PlcBooting: {
  //         type: 'boolean',
  //         subTag: 'PlcBooting',
  //       },
  //     },
  //     pulseCommands: {
  //       ...genericSystemPulseCommands,
  //     },
  //   },
  //   Granule: {
  //     tagPrefix: '_Granule',
  //     icon: '🍚',
  //     readTags: {
  //       ...genericSystemReadTags,
  //       SlotToDispense: {
  //         subTag: 'SlotToDispense',
  //         type: 'integer',
  //       },
  //       DispenseCountGoal: {
  //         subTag: 'DispenseCountGoal',
  //         type: 'integer',
  //       },
  //       DispenseCountSoFar: {
  //         subTag: 'DispenseCountSoFar',
  //         type: 'integer',
  //       },
  //     },
  //     pulseCommands: {
  //       ...genericSystemPulseCommands,
  //       DispenseAmount: {
  //         subTag: 'Cmd.DispenseAmount.HmiPb',
  //       },
  //     },
  //     valueCommands: {
  //       AmountToDispense: {
  //         type: 'integer',
  //         subTag: 'Cmd.AmountToDispense',
  //       },
  //     },
  //   },
  //   Piston: {
  //     tagPrefix: '_Piston',
  //     icon: '💩',
  //     readTags: {
  //       ...genericSystemReadTags,
  //       DispenseCountGoal: {
  //         subTag: 'DispenseCountGoal',
  //         type: 'integer',
  //       },
  //       DispenseCountSoFar: {
  //         subTag: 'DispenseCountSoFar',
  //         type: 'integer',
  //       },
  //     },
  //     pulseCommands: {
  //       ...genericSystemPulseCommands,
  //       DispenseAmount: {
  //         subTag: 'Cmd.DispenseAmount.HmiPb',
  //       },
  //     },
  //     valueCommands: {
  //       AmountToDispense: {
  //         type: 'integer',
  //         subTag: 'Cmd.AmountToDispense',
  //       },
  //     },
  //   },
  //   FillSystem: {
  //     tagPrefix: '_FillSystem',
  //     icon: '🥙',
  //     readTags: {
  //       ...genericSystemReadTags,
  //       Homed: {
  //         subTag: 'Homed',
  //         type: 'boolean',
  //       },
  //     },
  //     pulseCommands: {
  //       ...genericSystemPulseCommands,
  //       PositionAndDispenseAmount: {
  //         subTag: 'Cmd.PositionAndDispenseAmount.HmiPb',
  //       },
  //     },
  //     valueCommands: {
  //       AmountToDispense: {
  //         type: 'integer',
  //         subTag: 'Cmd.AmountToDispense',
  //       },
  //       SlotToDispense: {
  //         type: 'integer',
  //         subTag: 'Cmd.SlotToDispense',
  //       },
  //     },
  //   },
  //   FillPositioner: {
  //     tagPrefix: '_FillPositioner',
  //     icon: '↔️',
  //     readTags: {
  //       ...genericSystemReadTags,
  //       Homed: {
  //         subTag: 'Homed',
  //         type: 'boolean',
  //       },
  //       HomeLimitSwitched: {
  //         subTag: 'HomeLimitSwitched.SensorOn',
  //         type: 'boolean',
  //       },
  //       InputMotorReady: {
  //         subTag: 'InputMotorReady',
  //         type: 'boolean',
  //       },
  //       OutputMotorEnabled: {
  //         subTag: 'OutputMotorEnabled',
  //         type: 'boolean',
  //       },
  //       PositionDest: {
  //         subTag: 'PositionDest',
  //         type: 'integer',
  //       },
  //     },
  //     pulseCommands: {
  //       ...genericSystemPulseCommands,
  //       GoToPosition: {
  //         subTag: 'Cmd.GoToPosition.HmiPb',
  //       },
  //     },
  //     valueCommands: {
  //       Dest: {
  //         type: 'integer',
  //         subTag: 'Cmd.GoToPositionDest',
  //       },
  //     },
  //   },
  // };

  const readTags = async schema => {
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

  const mainSubsystems = {
    IOSystem: {
      tagPrefix: null,
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
    },
    System: {
      tagPrefix: '_System',
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
    },
  };
  let subsystems = { ...mainSubsystems };

  let mainRobotSchema = createSchema(subsystems);

  let updateCount = 0;
  async function connectKitchenClient() {
    const configRef = client.getRef('KitchenConfig');
    let fff = null;
    client
      .getRef('Airtable')
      .observeConnectedValue(['files', 'db.json', 'id'])
      .subscribe({
        next: atData => {
          if (atData === fff) {
            // console.log('DUPE AT UPDATE!'); // todo, fix dupe events from observeConnectedValue
            return;
          }
          const {
            KitchenSystems,
            KitchenSystemTags,
            KitchenSystemFaults,
          } = atData.baseTables;

          subsystems = {
            ...mainSubsystems,
          };
          Object.keys(KitchenSystems).forEach(kitchenSystemId => {
            const kitchenSystem = KitchenSystems[kitchenSystemId];
            const tags = Object.values(KitchenSystemTags).filter(tag => {
              return tag.System[0] === kitchenSystemId;
            });

            const readTags = {
              ...genericSystemReadTags,
            };
            const pulseCommands = {
              ...genericSystemPulseCommands,
            };
            const valueCommands = {};
            tags.forEach(tag => {
              if (tag.Type === 'Command DINT') {
                valueCommands[tag['Internal Name']] = {
                  type: 'integer',
                  subTag: tag['PLC Sub-Tag'],
                };
              } else if (tag.Type === 'Command BOOL') {
                valueCommands[tag['Internal Name']] = {
                  type: 'boolean',
                  subTag: tag['PLC Sub-Tag'],
                };
              } else if (tag.Type === 'Read DINT') {
                readTags[tag['Internal Name']] = {
                  type: 'integer',
                  subTag: tag['PLC Sub-Tag'],
                };
              } else if (tag.Type === 'Read BOOL') {
                readTags[tag['Internal Name']] = {
                  type: 'boolean',
                  subTag: tag['PLC Sub-Tag'],
                };
              } else if (tag.Type === 'Command Pulse BOOL') {
                pulseCommands[tag['Internal Name']] = {
                  subTag: tag['PLC Sub-Tag'],
                };
              } else {
                throw new Error(`Unexpected tag type "${tag.Type}"`);
              }
            });
            subsystems[kitchenSystem.Name] = {
              tagPrefix: kitchenSystem['PLC System Name'],
              icon: kitchenSystem.Icon,
              readTags,
              valueCommands,
              pulseCommands,
            };
          });

          mainRobotSchema = createSchema(subsystems);

          configRef
            .put(mainRobotSchema.config)
            .then(() => {})
            .catch(console.error);
        },
        error: console.error,
        complete: () => {},
      });

    const stateRef = client.getRef('KitchenState');

    let currentState;
    const getTagValues = tags => mapObject(tags, tag => tag.value);
    const updateTags = async () => {
      const lastState = currentState;
      currentState = getTagValues(await readTags(mainRobotSchema, {}));
      updateCount++;
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
    const { immediateOutput, clearPulseOutput } = extractActionValues({
      subSystemConfig: subsystem,
      systemName: action.subsystem,
      pulse: action.pulse,
      values: action.values,
    });
    await writeTags(mainRobotSchema, immediateOutput);
    await delay(500);
    await writeTags(mainRobotSchema, clearPulseOutput);
    return { ...immediateOutput, ...clearPulseOutput };
  }

  let debugInterval = setInterval(() => {
    console.log('Has updated tags ' + updateCount + ' times');
    updateCount = 0;
  }, 10000);

  function close() {
    clearInterval(debugInterval);
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
