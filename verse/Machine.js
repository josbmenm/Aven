import { combineStreams } from '../cloud-core/createMemoryStream';

const { Controller, Tag, EthernetIP, TagGroup } = require('ethernet-ip');
const { INT, BOOL } = EthernetIP.CIP.DataTypes.Types;
const shallowEqual = require('fbjs/lib/shallowEqual');

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

export const getTagOfSchema = tagSchema => {
  return new Tag(
    tagSchema.tag,
    tagSchema.program,
    getTypeOfSchema(tagSchema.type),
  );
};

function mapObject(inObj, mapper) {
  const out = {};
  Object.keys(inObj).forEach(k => {
    out[k] = mapper(inObj[k]);
  });
  return out;
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
  actionId,
}) => {
  const pulseCommands = subSystemConfig.pulseCommands || {};
  const valueCommands = subSystemConfig.valueCommands || {};
  const immediateOutput = {};
  const clearPulseOutput = {};
  let tagOutput = {};

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
  Object.entries(values).forEach(([valueName, value]) => {
    const valueSpec = valueCommands[valueName];
    if (!valueSpec) {
      throw new Error('Invalid value name: ' + valueName);
    }
    const internalTagName = `${systemName}_${valueName}_VALUE`;
    tagOutput[internalTagName] = value;
  });

  // actionId
  if (actionId != null && systemName !== 'System') {
    tagOutput[`${systemName}_ActionIdIn_VALUE`] = actionId;
  }
  return { immediateOutput, clearPulseOutput, tagOutput };
};

class PLCConnectionError extends Error {
  constructor() {
    super('Timeout while connecting to PLC');
  }
  code = 'PLC_Connection';
}

export function connectMachine({
  commands,
  configStream,
  kitchenStateDoc,
  restaurantStateStream,
  computeSequencerNextSteps,
  onDispatcherAction,
  plcIP,
  logBehavior,
  computeSideEffects,
}) {
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
    connectingPLC = mainPLC.connect(plcIP, 0).then(async () => {
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
    });
    connectingPLC.catch(err => {
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

  const PLC_READ_TIMEOUT_SEC = 10;

  const DEBUG_READS = false;

  async function doReadTags(schema) {
    const readings = {};

    const PLC = await getReadyPLC();

    async function slowDebugRead() {
      let readingPromise = Promise.resolve();
      const failedTags = [];
      Object.keys(schema.tags).forEach(tagId => {
        readingPromise = readingPromise.then(() => {
          return PLC.readTag(schema.tags[tagId]).catch(e => {
            failedTags.push(tagId);
          });
        });
      });
      await readingPromise;
      return failedTags;
    }

    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        console.error(`Tag read timeout after ${PLC_READ_TIMEOUT_SEC} seconds`);
        reject(new Error('Error reading tags in time'));
        readyPLC = null;
      }, PLC_READ_TIMEOUT_SEC * 1000);
      if (DEBUG_READS) {
        slowDebugRead()
          .then(failedTags => {
            if (failedTags.length) {
              console.error('Failing to read tags: ' + failedTags.join(', '));
            }
          })
          .catch(e => {
            console.error('Error on the DEBUG tag read!');
          });
      } else {
        PLC.readTagGroup(schema.allTagsGroup)
          .then(results => {
            clearTimeout(timer);
            resolve(results);
          })
          .catch(err => {
            console.error('PLC read Hiccup. Retrying in 250ms...', err);
            setTimeout(() => {
              PLC.readTagGroup(schema.allTagsGroup)
                .then(results => {
                  clearTimeout(timer);
                  resolve(results);
                })
                .catch(err => {
                  console.error(
                    'PLC reads failing! Trying individual tags...',
                    err,
                  );

                  slowDebugRead()
                    .then(failedTags => {
                      console.error(
                        `On slow read, ${
                          failedTags.length
                        } tags failed to read`,
                      );
                      if (failedTags.length) {
                        console.error('Failed tags: ' + failedTags.join(', '));
                      }
                    })
                    .catch(e => {
                      console.error('Error on the DEBUG tag read!');
                      console.error('==SLOW DEBUG ERROR:', e);
                      console.error('==FAST READ ERROR', err);
                    });
                });
            }, 250);
            // failed to read all the tags.. read each individually to see which fail, and report the result

            clearTimeout(timer);
            reject(err);
          });
      }
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

  const subsystemResolvers = {};

  async function connectKitchenClient() {
    console.log('Waiting for Kitchen Configuration...');
    configStream.addListener({
      next: config => {
        if (!config) {
          return;
        }
        console.log('Loaded Kitchen Configuration!', !!config);
        mainRobotSchema = createSchema(config);
      },
    });

    await kitchenStateDoc.putValue({
      isPLCConnected: false,
    });

    const getTagValues = tags => mapObject(tags, tag => tag.value);
    let currentState = {};
    const updateTags = async () => {
      const lastState = currentState;
      let isPLCConnected = false;
      if (mainRobotSchema) {
        const readings = await doReadTags(mainRobotSchema, {});
        isPLCConnected = true;
        currentState = getTagValues(readings);
      }
      if (shallowEqual(lastState, currentState)) {
        // the state doesn't appear to be changing. cool off and wait a 1/4 sec..
        await delay(250);
        return;
      }
      await kitchenStateDoc.putValue({
        ...currentState,
        isPLCConnected,
      });

      Object.entries(subsystemResolvers).forEach(([subsystem, resolver]) => {
        const noFaults = currentState[`${subsystem}_NoFaults_READ`];
        const startedActionId =
          currentState[`${subsystem}_ActionIdStarted_READ`];
        const endedActionId = currentState[`${subsystem}_ActionIdEnded_READ`];
        const isSystemIdle = currentState[`${subsystem}_PrgStep_READ`] === 0;
        const isActionReceived = startedActionId === resolver.actionId;
        const isActionComplete = endedActionId === resolver.actionId;
        if (isActionReceived && (isSystemIdle || isActionComplete)) {
          logBehavior(
            `${noFaults ? 'Done with' : 'FAULTED on'} ${resolver.actionId}`,
          );
          if (noFaults) {
            resolver.resolve();
          } else {
            resolver.reject(new Error(`System "${subsystem}" has faulted`));
          }
        }
      });

      await delay(64); // give js ~64ms to respond to this change.
    };
    const updateTagsForever = () => {
      if (hasClosed) {
        return;
      }
      updateTags()
        .then(() => {})
        .catch(async e => {
          console.error('Error updating tags!');
          console.error(e);
          await kitchenStateDoc.putValue({
            isPLCConnected: false,
          });
        })
        .finally(() => {
          updateTagsForever();
        });
    };
    updateTagsForever();
  }

  async function writeMachineValues(action) {
    const actionId = action.actionId || getFreshActionId();
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
      actionId,
    });
    await writeTags(mainRobotSchema, tagOutput);
    await writeTags(mainRobotSchema, immediateOutput);
    (async () => {
      await delay(250);
      await writeTags(mainRobotSchema, clearPulseOutput);
    })()
      .then(() => {})
      .catch(err => {
        console.error('Error writing machine value for pulse clearing..');
        console.error({
          clearPulseOutput,
          actionId,
          subsystem: action.subsystem,
        });
        console.error(err);
      });

    return { ...immediateOutput, ...clearPulseOutput, ...(tagOutput || {}) };
  }

  connectKitchenClient()
    .then(() => {})
    .catch(e => {
      console.error(e);
      process.exit();
    });

  function verboseLog(msg) {
    console.log(msg);
    return;
  }

  async function command(action) {
    const commandType = commands[action.command];

    if (!commandType) {
      throw new Error(`Unknown kitchen command "${action.command}"`);
    }
    const { valueParamNames, pulse, subsystem } = commandType;
    const values = { ...commandType.values };
    valueParamNames &&
      Object.keys(valueParamNames).forEach(valueCommandName => {
        const provided =
          action.params && action.params[valueParamNames[valueCommandName]];
        if (provided != null) {
          values[valueCommandName] = provided;
        }
      });
    const actionId = getFreshActionId();
    logBehavior(`Start Action ${actionId} : ${JSON.stringify(action)}`);

    if (subsystemResolvers[subsystem]) {
      throw new Error(
        `Already waiting for an action to resolve on the "${subsystem}" subsystem.`,
      );
    }

    await writeMachineValues({
      actionId,
      subsystem,
      pulse,
      values,
    });
    await new Promise((resolve, reject) => {
      let watchKittyTimeout = setTimeout(() => {
        delete subsystemResolvers[subsystem];
        console.error('MEOW!', { actionId, subsystem, pulse, values });
        reject(
          new Error(`Watch kitty timeout on "${subsystem}" system, meow!`),
        );
      }, 2 * 60 * 1000);
      subsystemResolvers[subsystem] = {
        resolve: value => {
          delete subsystemResolvers[subsystem];
          clearTimeout(watchKittyTimeout);
          resolve(value);
        },
        reject: err => {
          delete subsystemResolvers[subsystem];
          clearTimeout(watchKittyTimeout);
          reject(err);
        },
        actionId,
      };
    });
    return action;
  }

  let _restaurantState = null;
  let _kitchenState = null;
  let _kitchenConfig = null;
  let currentStepPromises = {};

  function handleSequencerUpdates(
    restaurantState,
    kitchenState,
    kitchenConfig,
  ) {
    let sideEffectActions = null;
    if (restaurantState !== undefined) _restaurantState = restaurantState;
    if (kitchenState !== undefined) {
      if (_kitchenState !== kitchenState) {
        const lastKitchenState = _kitchenState;
        _kitchenState = kitchenState;
        sideEffectActions = computeSideEffects(
          lastKitchenState,
          kitchenState,
          restaurantState,
        );
        if (sideEffectActions && sideEffectActions.length) {
          console.log('Applying side effect actions: ', sideEffectActions);

          let promise = Promise.resolve();
          sideEffectActions.forEach(action => {
            promise = promise.then(async () => {
              await onDispatcherAction(action);
            });
          });
          promise.catch(error => {
            console.error(
              'Error performing side effect(s)!',
              sideEffectActions,
            );
            console.error(error);
          });
        }
      }
    }
    if (kitchenConfig !== undefined) _kitchenConfig = kitchenConfig;
    if (!restaurantState) return verboseLog('Missing RestaurantState');
    if (!kitchenState) return verboseLog('Missing KitchenState');
    if (!kitchenConfig) return verboseLog('Missing kitchenConfig');
    if (!restaurantState.isAutoRunning)
      return verboseLog('Is not auto-running');
    if (!restaurantState.isAttached) return verboseLog('Is not attached');
    const nextSteps = computeSequencerNextSteps(
      restaurantState,
      kitchenConfig,
      kitchenState,
    );
    if (!nextSteps || !nextSteps.length) {
      return verboseLog('No steps available to take');
    }

    nextSteps.forEach(nextStep => {
      const commandType = commands[nextStep.command.command];
      const subsystem = commandType.subsystem;
      if (currentStepPromises[subsystem]) {
        return;
      }

      if (!kitchenState.isPLCConnected) {
        return;
      }
      logBehavior(`Performing ${subsystem} ${nextStep.description}`);
      currentStepPromises[subsystem] = nextStep.perform(
        onDispatcherAction,
        command,
      );

      currentStepPromises[subsystem]
        .then(() => {
          currentStepPromises[subsystem] = null;
          console.log(`Done with ${nextStep.description}`);
          setTimeout(() => {
            if (
              kitchenState !== _kitchenState ||
              kitchenConfig !== _kitchenConfig ||
              restaurantState !== _restaurantState
            ) {
              handleSequencerUpdates(
                _restaurantState,
                _kitchenState,
                _kitchenConfig,
              );
            }
          }, 50);
        })
        .catch(e => {
          currentStepPromises[subsystem] = null;
          console.error(
            `Failed to perform Kitchen Action: ${
              nextStep.description
            }. JS is basically faulted now??`,
            e,
          );
        });
    });
  }

  const sequencerStateStream = combineStreams({
    restaurantState: restaurantStateStream,
    kitchenState: kitchenStateDoc.value.stream,
    kitchenConfig: configStream,
  });
  const sequencerStateStreamListener = {
    next: ({ restaurantState, kitchenState, kitchenConfig }) => {
      handleSequencerUpdates(restaurantState, kitchenState, kitchenConfig);
    },
    error: e => {
      console.error('Failure in sequencer state stream');
      console.error(e);
      process.exit(1);
    },
  };
  sequencerStateStream.addListener(sequencerStateStreamListener);

  function close() {
    sequencerStateStream.removeListener(sequencerStateStreamListener);
    readyPLC && readyPLC.destroy();
    readyPLC = null;
    hasClosed = true;
  }

  return {
    command,
    close,
    writeMachineValues,
  };
}
