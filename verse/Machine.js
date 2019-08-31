import { combineStreams } from '../cloud-core/createMemoryStream';
import { computeNextSteps } from '../logic/MachineLogic';
import { log, error, fatal } from '../logger/logger';

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
  sequencerSteps,
  onDispatcherAction,
  plcIP,
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
      log('MachineConnected', {
        plcName: mainPLC.properties.name,
        ipAddress: plcIP,
      });
      readyPLC = mainPLC;
      Array.from(readyHandlers).forEach(h => h());
    });
    connectingPLC.catch(err => {
      error('MachineError', { code: 'CannotConnectPLC' });
      readyPLC = null;
      connectingPLC = null;
    });
  }

  const getReadyPLC = async () => {
    connectPLC();
    await waitForConnection();
    if (!readyPLC) {
      error('MachineError', { code: 'CannotGetPLC' });
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
        error('MachineError', {
          code: 'TagReadTimeout',
          seconds: PLC_READ_TIMEOUT_SEC,
        });
        reject(new Error('Error reading tags in time'));
        readyPLC = null;
      }, PLC_READ_TIMEOUT_SEC * 1000);
      if (DEBUG_READS) {
        slowDebugRead()
          .then(failedTags => {
            if (failedTags.length) {
              error('MachineError', { code: 'TagReadsFailing', failedTags });
            }
          })
          .catch(e => {
            error('MachineError', { code: 'DebugTagReadError', error: e });
          });
      } else {
        PLC.readTagGroup(schema.allTagsGroup)
          .then(results => {
            clearTimeout(timer);
            resolve(results);
          })
          .catch(err => {
            error('MachineError', { code: 'AllReadsFailedOnce', error: err });

            setTimeout(() => {
              PLC.readTagGroup(schema.allTagsGroup)
                .then(results => {
                  clearTimeout(timer);
                  resolve(results);
                })
                .catch(err => {
                  error('MachineError', {
                    code: 'AllReadsFailing',
                    fastError: err,
                  });
                  slowDebugRead()
                    .then(failedTags => {
                      if (failedTags.length) {
                        error('MachineError', {
                          code: 'FailedReads',
                          failedReads: failedTags,
                        });
                      }
                    })
                    .catch(e => {
                      error('MachineError', {
                        code: 'AllReadsFailing',
                        fastError: err,
                        debugError: e,
                      });
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
    const PLC = await getReadyPLC();
    await PLC.writeTagGroup(outputGroup);
  };

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  let mainRobotSchema = null;

  const subsystemResolvers = {};

  async function connectKitchenClient() {
    console.log('Waiting for Kitchen Configuration...');
    let lastConfig = undefined;
    configStream.addListener({
      next: config => {
        // log('MachineConfigured', {
        //   hadConfig: !!lastConfig,
        //   hasConfig: !!config,
        // });
        mainRobotSchema = createSchema(config);
        lastConfig = config;
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
        const isActionComplete =
          noFaults && endedActionId === resolver.actionId;
        if (isActionReceived && (isSystemIdle || isActionComplete)) {
          if (isActionComplete) {
            resolver.resolve();
          } else {
            if (noFaults) {
              error('MachineError', {
                code: 'SoftError',
                subsystem,
                noFaults,
                isActionReceived,
                isActionComplete,
              });
              resolver.reject(
                new Error(
                  `System "${subsystem}" has experienced a soft error. No faults, but the action did not succeed.`,
                ),
              );
            } else {
              error('MachineError', {
                code: 'Fault',
                subsystem,
                noFaults,
                isActionReceived,
                isActionComplete,
              });
              resolver.reject(new Error(`"${subsystem}" system faulted!`));
            }
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
          // error is presumably logged elsewhere, but to be safe..
          error('MachineError', { code: 'TagUpdateError', error: e });

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
        error('MachineError', {
          code: 'PulseClearWrite',
          error: err,
          clearPulseOutput,
          actionId,
          subsystem: action.subsystem,
        });
      });

    return { ...immediateOutput, ...clearPulseOutput, ...(tagOutput || {}) };
  }

  connectKitchenClient()
    .then(() => {})
    .catch(e => {
      fatal('MachineError', { code: 'InitialMachineConnection', error: e });
      process.exit();
    });

  async function command(action) {
    const commandType = commands[action.commandType];

    if (!commandType) {
      throw new Error(`Unknown kitchen command "${action.commandType}"`);
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

    log('MachineCommandStart', {
      actionId,
      action,
    });

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
        error('MachineError', {
          code: 'WatchKittyTimeout',
          actionId,
          subsystem,
          pulse,
          values,
        });
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

    log('MachineCommandEnd', {
      actionId,
      action,
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
          log('MachineEffects', {
            actions: sideEffectActions,
          });
          let promise = Promise.resolve();
          sideEffectActions.forEach(action => {
            promise = promise
              .then(async () => {
                await onDispatcherAction(action);
              })
              .catch(error => {
                error('MachineError', {
                  code: 'SideEffectPerformError',
                  error,
                  action,
                });
              });
          });
        }
      }
    }
    if (kitchenConfig !== undefined) _kitchenConfig = kitchenConfig;
    if (!restaurantState)
      return error('MachineError', { code: 'MissingRestaurantState' });
    if (!kitchenState)
      return error('MachineError', { code: 'MissingKitchenState' });
    if (!kitchenConfig)
      return error('MachineError', { code: 'MissingkitchenConfig' });
    if (!restaurantState.isAutoRunning) return; // the sequencer only goes when it is "running"
    if (!restaurantState.isAttached) return; // the sequencer only goes when it is "attached"

    const nextSteps = computeNextSteps(
      sequencerSteps,
      restaurantState,
      kitchenConfig,
      kitchenState,
      commands,
    );

    nextSteps.forEach(nextStep => {
      if (!nextStep.isMachineReady) {
        return;
      }
      if (!nextStep.isCommandReady) {
        return;
      }
      if (!nextStep.isReady) {
        return;
      }
      const commandType = commands[nextStep.command.commandType];
      const subsystem = commandType.subsystem;
      if (currentStepPromises[subsystem]) {
        return;
      }

      if (!kitchenState.isPLCConnected) {
        return;
      }
      log('StepStart', {
        description: nextStep.description,
        command: nextStep.command,
      });

      currentStepPromises[subsystem] = nextStep.perform(
        onDispatcherAction,
        command,
      );

      currentStepPromises[subsystem]
        .then(() => {
          currentStepPromises[subsystem] = null;
          log('StepComplete', {
            description: nextStep.description,
            command: nextStep.command,
          });
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
          error('StepError', {
            error: e,
            stepDescription: nextStep.description,
            command: nextStep.command,
          });
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
      fatal('MachineError', { code: 'SequencerStateStream', error: e });
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
