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

const sequencerSystemReadTags = {
  NoFaults: {
    type: 'boolean',
    subTag: 'NoFaults',
  },
  ActionIdOut: {
    type: 'integer',
    subTag: 'Crumb.ActionIdOut',
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

const sequencerSystemPulseCommands = {
  Reset: {
    subTag: 'Cmd.Reset.HmiPb',
  },
  Home: {
    subTag: 'Cmd.Home.HmiPb',
  },
};
const sequencerSystemValueCommands = {
  ActionIdIn: {
    type: 'integer',
    subTag: 'Crumb.ActionIdIn',
  },
};
const mainSubsystems = {
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

export function computeKitchenConfig(cloud) {
  const configRef = cloud.get('KitchenConfig');
  cloud
    .get('Airtable')
    .observeConnectedValue(['files', 'db.json', 'id'])
    .subscribe({
      next: atData => {
        if (atData == null) {
          return;
        }
        const {
          KitchenSystems,
          KitchenSystemTags,
          KitchenSystemFaults,
        } = atData.baseTables;
        if (!KitchenSystems) {
          return;
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
          const readTags = {
            ...((kitchenSystem.HasSequencer && sequencerSystemReadTags) || {}),
          };
          const pulseCommands = {
            ...((kitchenSystem.HasSequencer && sequencerSystemPulseCommands) ||
              {}),
          };
          const valueCommands = {
            ...((kitchenSystem.HasSequencer && sequencerSystemValueCommands) ||
              {}),
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
              throw new Error(`Unexpected tag type "${tag.Type}"`);
            }
          });
          subsystems[kitchenSystem.Name] = {
            tagPrefix: kitchenSystem['PLC System Name'],
            icon: kitchenSystem.Icon,
            readTags,
            valueCommands,
            pulseCommands,
            faults,
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
          Object.keys(subsystem.pulseCommands || {}).forEach(
            pulseCommandName => {
              const internalTagName = `${subsystemName}_${pulseCommandName}_PULSE`;
              const pulseCommandSpec =
                subsystem.pulseCommands[pulseCommandName];
              tags[internalTagName] = {
                subSystem: subsystemName,
                name: pulseCommandName,
                type: 'boolean',
                tag: getExternalTagName(
                  subsystem.tagPrefix,
                  pulseCommandSpec.subTag,
                ),
                enableOutput: true,
              };
            },
          );
          Object.keys(subsystem.valueCommands || {}).forEach(
            valueCommandName => {
              const internalTagName = `${subsystemName}_${valueCommandName}_VALUE`;
              const valueCommandSpec =
                subsystem.valueCommands[valueCommandName];
              tags[internalTagName] = {
                subSystem: subsystemName,
                name: valueCommandName,
                type: valueCommandSpec.type,
                tag: getExternalTagName(
                  subsystem.tagPrefix,
                  valueCommandSpec.subTag,
                ),
                enableOutput: true,
              };
            },
          );
        });

        configRef
          .put({ subsystems, tags })
          .then(() => {})
          .catch(console.error);
      },
      error: console.error,
      complete: () => {},
    });
}

const createSchema = config => {
  const tags = {};
  const allTagsGroup = new TagGroup();
  Object.keys(config.tags).forEach(tagAlias => {
    tags[tagAlias] = getTagOfSchema(config.tags[tagAlias]);
    allTagsGroup.add(tags[tagAlias]);
  });
  return { config, tags, allTagsGroup };
};

const extractActionValues = ({
  subSystemConfig,
  pulse,
  values,
  systemName,
  tag,
}) => {
  const pulseCommands = subSystemConfig.pulseCommands || {};
  const valueCommands = subSystemConfig.valueCommands || {};
  const immediateOutput = {};
  const clearPulseOutput = {};
  let tagOutput = null;

  // pulses
  pulse.forEach(pulseName => {
    const pulseSpec = pulseCommands[pulseName];
    if (!pulseSpec) {
      throw new Error('Invalid pulse type!');
    }
    const internalTagName = `${systemName}_${pulseName}_PULSE`;
    immediateOutput[internalTagName] = true;
    clearPulseOutput[internalTagName] = false;
  });

  // values
  Object.keys(values).forEach(valueName => {
    const valueSpec = valueCommands[valueName];
    if (!valueSpec) {
      throw new Error('Invalid value name: ' + valueName);
    }
    const internalTagName = `${systemName}_${valueName}_VALUE`;
    immediateOutput[internalTagName] = values[valueName];
  });

  // tag
  if (tag != null) {
    tagOutput = {};
    tagOutput[`${systemName}_ActionIdIn_VALUE`] = tag;
    // immediateOutput[`${systemName}_ActionIdIn_VALUE`] = tag;
  }

  return { immediateOutput, clearPulseOutput, tagOutput };
};

class PLCConnectionError extends Error {
  constructor() {
    super('Timeout while connecting to PLC');
  }
  code = 'PLC_Connection';
}

export default function startKitchen({ client, plcIP, logBehavior }) {
  let readyPLC = null;
  let connectingPLC = null;
  let readyHandlers = new Set();

  let hasClosed = false;

  const waitForConnection = () => {
    if (readyPLC) {
      return;
    }
    return new Promise((resolve, reject) => {
      readyHandlers.add(resolve),
        setTimeout(() => {
          reject(new PLCConnectionError());
        }, 1000);
    });
  };
  function connectPLC() {
    if (readyPLC || connectingPLC || hasClosed) {
      return;
    }
    const mainPLC = new Controller();
    connectingPLC = mainPLC.connect(plcIP, 0);

    connectingPLC
      .then(async () => {
        connectingPLC = null;
        if (hasClosed) {
          mainPLC.destroy();
          return;
        }
        logBehavior(
          'PLC Connected. (' + mainPLC.properties.name + ' at ' + plcIP + ')',
        );
        readyPLC = mainPLC;
        Array.from(readyHandlers).forEach(h => h());
      })
      .catch(err => {
        console.error('PLC Connection Error', err);
        readyPLC = null;
        connectingPLC = null;
      });
  }

  const getReadyPLC = async () => {
    connectPLC();
    await waitForConnection();
    if (!readyPLC) {
      throw new Error('PLC not ready!');
    }
    return readyPLC;
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
  //       ...sequencerSystemPulseCommands,
  //     },
  //   },
  //   Granule: {
  //     tagPrefix: '_Granule',
  //     icon: '🍚',
  //     readTags: {
  //       ...sequencerSystemReadTags,
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
  //       ...sequencerSystemPulseCommands,
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
  //       ...sequencerSystemReadTags,
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
  //       ...sequencerSystemPulseCommands,
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
  //       ...sequencerSystemReadTags,
  //       Homed: {
  //         subTag: 'Homed',
  //         type: 'boolean',
  //       },
  //     },
  //     pulseCommands: {
  //       ...sequencerSystemPulseCommands,
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
  //       ...sequencerSystemReadTags,
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
  //       ...sequencerSystemPulseCommands,
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

  async function readTags(schema) {
    const readings = {};

    const PLC = await getReadyPLC();

    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        console.error('Tag read timeout after 2 seconds');
        reject(new Error('Error reading tags in time'));
        readyPLC = null;
      }, 2000);
      PLC.readTagGroup(schema.allTagsGroup)
        .then(results => {
          clearTimeout(timer);
          resolve(results);
        })
        .catch(reject);
    });

    Object.keys(schema.config.tags).forEach(tagAlias => {
      readings[tagAlias] = {
        ...schema.config.tags[tagAlias],
        value: schema.tags[tagAlias].value,
      };
    });

    return readings;
  }

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
    logBehavior('Kitchen Write Tags ' + JSON.stringify(values));
    const PLC = await getReadyPLC();
    await PLC.writeTagGroup(outputGroup);
  };

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  let mainRobotSchema = null;

  async function connectKitchenClient() {
    client.get('KitchenConfig').observeValue.subscribe({
      // unsub one day
      next: config => {
        if (!config) {
          return;
        }
        mainRobotSchema = createSchema(config);
      },
    });

    const stateRef = client.get('KitchenState');

    await stateRef.put({
      isPLCConnected: false,
    });

    const getTagValues = tags => mapObject(tags, tag => tag.value);
    let currentState = {};
    const updateTags = async () => {
      const lastState = currentState;
      let isPLCConnected = false;
      try {
        if (mainRobotSchema) {
          const readings = await readTags(mainRobotSchema, {});
          isPLCConnected = true;
          currentState = getTagValues(readings);
        }
      } catch (e) {}
      if (shallowEqual(lastState, currentState)) {
        // the state doesn't appear to be changing. cool off and wait a 1/4 sec..
        await delay(250);
        return;
      }
      await stateRef.put({
        ...currentState,
        isPLCConnected,
      });
      await delay(15); // give js ~15ms to respond to this change.
    };
    const updateTagsForever = () => {
      if (hasClosed) {
        return;
      }
      updateTags()
        .then(() => {})
        .catch(async e => {
          await stateRef.put({
            isPLCConnected: false,
          });
        })
        .finally(() => {
          updateTagsForever();
        });
    };
    updateTagsForever();
  }

  async function dispatchCommand(action) {
    if (!mainRobotSchema) {
      return;
    }
    const subsystem = mainRobotSchema.config.subsystems[action.subsystem];
    const {
      immediateOutput,
      clearPulseOutput,
      tagOutput,
    } = extractActionValues({
      subSystemConfig: subsystem,
      systemName: action.subsystem,
      pulse: action.pulse,
      values: action.values,
      tag: action.tag,
    });
    await writeTags(mainRobotSchema, immediateOutput);
    tagOutput && (await writeTags(mainRobotSchema, tagOutput));
    await writeTags(mainRobotSchema, clearPulseOutput);
    return { ...immediateOutput, ...clearPulseOutput, ...(tagOutput || {}) };
  }

  function close() {
    // clearInterval(debugInterval);
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
