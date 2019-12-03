import { combineStreams } from '../cloud-core/createMemoryStream';
import { computeNextSteps } from '../logic/MachineLogic';
import { log, error, fatal } from '../logger/logger';
import Err from '../utils/Err';

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

export function getFreshCommandId() {
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

const extractMachineValues = ({
  subSystemConfig,
  pulse,
  values,
  systemName,
  commandId,
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
      throw new Error(
        'Invalid value name on ' + systemName + ' system: ' + valueName,
      );
    }
    const internalTagName = `${systemName}_${valueName}_VALUE`;
    tagOutput[internalTagName] = value;
  });

  // command Id (actionId, as known in the plc)
  if (commandId != null && systemName !== 'System') {
    tagOutput[`${systemName}_ActionIdIn_VALUE`] = commandId;
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
  restaurantStateDispatch,
  plcIP,
  computeSideEffects,
  deriveAppliedMachineState,
}) {
  let readyPLC = null;
  let connectingPLC = null;
  let readyHandlers = new Set();

  let hasClosed = false;

  let _kitchenState = null;

  async function updateKitchenState(state) {
    _kitchenState = state;
    observeSideEffects();
    scheduleSequencerStep();
    await kitchenStateDoc.putValue(state);
  }

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
              clearTimeout(timer);
              reject(new Error('Could not read debug tags'));
            } else {
              clearTimeout(timer);
              resolve();
            }
          })
          .catch(e => {
            error('MachineError', { code: 'DebugTagReadError', error: e });
            clearTimeout(timer);
            reject(new Error('Could not read debug tags'));
          });
      } else {
        PLC.readTagGroup(schema.allTagsGroup)
          .then(() => {
            clearTimeout(timer);
            resolve();
          })
          .catch(err => {
            error('MachineError', { code: 'AllReadsFailedOnce', error: err });

            setTimeout(() => {
              PLC.readTagGroup(schema.allTagsGroup)
                .then(() => {
                  clearTimeout(timer);
                  resolve();
                })
                .catch(err => {
                  slowDebugRead().then(failedTags => {
                    if (failedTags.length) {
                      error('MachineError', {
                        code: 'FailedReads',
                        failedReads: failedTags,
                      });
                    }
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

  let currentMachineSchema = null;

  async function writeTags(values) {
    if (!currentMachineSchema) {
      throw new Error('Cannot write tags without the machine schema');
      return;
    }
    const outputGroup = new TagGroup();
    const robotTags = currentMachineSchema.config.tags;
    Object.keys(values).forEach(tagAlias => {
      if (!robotTags[tagAlias] || !robotTags[tagAlias].enableOutput) {
        throw new Error(`Output is not configured for "${tagAlias}"`);
      }
      const tag = currentMachineSchema.tags[tagAlias];
      tag.value = values[tagAlias];
      outputGroup.add(tag);
    });
    const PLC = await getReadyPLC();
    await PLC.writeTagGroup(outputGroup);
  }

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  const subsystemResolvers = {};

  async function connectKitchenClient() {
    log('ConnectingKitchenClient');
    let lastConfig = undefined;
    configStream.addListener({
      next: config => {
        // log('MachineConfigured', {
        //   hadConfig: !!lastConfig,
        //   hasConfig: !!config,
        // });
        currentMachineSchema = createSchema(config);
        lastConfig = config;
      },
    });

    await updateKitchenState({
      isPLCConnected: false,
    });

    const getTagValues = tags => mapObject(tags, tag => tag.value);
    let currentState = {};
    const updateTags = async () => {
      const lastState = currentState;
      let isPLCConnected = false;
      if (currentMachineSchema) {
        const readings = await doReadTags(currentMachineSchema, {});
        isPLCConnected = true;
        currentState = getTagValues(readings);
      }
      if (shallowEqual(lastState, currentState)) {
        // the state doesn't appear to be changing. cool off and wait a bit
        await delay(50);
        return;
      }
      await updateKitchenState({
        ...currentState,
        isPLCConnected,
      });

      Object.entries(subsystemResolvers).forEach(([subsystem, resolver]) => {
        if (!resolver) return;
        const noFaults = currentState[`${subsystem}_NoFaults_READ`];
        const startedCommandId =
          currentState[`${subsystem}_ActionIdStarted_READ`];
        const endedCommandId = currentState[`${subsystem}_ActionIdEnded_READ`];
        const isSystemIdle = currentState[`${subsystem}_PrgStep_READ`] === 0;
        const isCommandReceived = startedCommandId === resolver.commandId;
        const isCommandComplete =
          noFaults && endedCommandId === resolver.commandId;
        if (!isCommandReceived && resolver.startTime + 400 < Date.now()) {
          error('MachineError', {
            ..._kitchenState,
            code: 'CommandNotReceived',
            subsystem,
            noFaults,
            startedCommandId,
            endedCommandId,
            commandId: resolver.commandId,
            command: resolver.command,
            isCommandReceived,
            isCommandComplete,
          });
          resolver.reject(
            new Error(`System "${subsystem}" did not receive this command id.`),
          );
          return;
        }
        if (
          isCommandReceived &&
          (isCommandComplete ||
            (isSystemIdle && resolver.startTime + 500 < Date.now()))
        ) {
          if (isCommandComplete) {
            resolver.resolve();
          } else {
            if (noFaults) {
              error('MachineError', {
                ..._kitchenState,
                code: 'SoftError',
                subsystem,
                noFaults,
                startedCommandId,
                endedCommandId,
                commandId: resolver.commandId,
                command: resolver.command,
                isCommandReceived,
                isCommandComplete,
              });

              resolver.reject(
                new Error(
                  `System "${subsystem}" has experienced a soft error. No faults, but the command did not succeed.`,
                ),
              );
            } else {
              error('MachineError', {
                ..._kitchenState,
                code: 'Fault',
                subsystem,
                noFaults,
                isCommandReceived,
                isCommandComplete,
              });
              resolver.reject(
                new Err(`"${subsystem}" system faulted!`, 'SystemFault', {
                  subsystem,
                }),
              );
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

          await updateKitchenState({
            isPLCConnected: false,
          });
          await delay(2000); // give the PLC and network 2 seconds to come to senses. (avoid spamming the logs)
        })
        .finally(() => {
          updateTagsForever();
        });
    };
    updateTagsForever();
  }

  async function writeMachineValues(action) {
    const commandId = action.commandId || getFreshCommandId();
    if (!currentMachineSchema) {
      return;
    }
    const subsystem = currentMachineSchema.config.subsystems[action.subsystem];
    const {
      immediateOutput,
      clearPulseOutput,
      tagOutput,
    } = extractMachineValues({
      subSystemConfig: subsystem,
      systemName: action.subsystem,
      pulse: action.pulse,
      values: action.values,
      commandId,
    });
    await writeTags(tagOutput);
    await writeTags(immediateOutput);
    (async () => {
      await delay(250);
      await writeTags(clearPulseOutput);
    })()
      .then(() => {})
      .catch(err => {
        error('MachineError', {
          ..._kitchenState,
          code: 'PulseClearWrite',
          code: err.message,
          clearPulseOutput,
          commandId,
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

  async function runCommand(command) {
    const commandType = commands[command.commandType];

    if (!commandType) {
      throw new Error(`Unknown kitchen command "${command.commandType}"`);
    }
    const { valueParamNames, pulse, subsystem } = commandType;
    const values = { ...commandType.values };
    valueParamNames &&
      Object.keys(valueParamNames).forEach(valueCommandName => {
        const provided =
          command.params && command.params[valueParamNames[valueCommandName]];
        if (provided != null) {
          values[valueCommandName] = provided;
        }
      });
    const commandId = getFreshCommandId();
    const commandStartTimeMS = Date.now();
    log('MachineCommandStart', {
      commandId,
      commandStartTimeMS,
      command,
    });

    if (subsystemResolvers[subsystem]) {
      throw new Error(
        `Already waiting for a command to resolve on the "${subsystem}" subsystem.`,
      );
    }

    subsystemResolvers[subsystem] = {}; // use this to lock subsystem temporarily while writing values. todo: action id reception timeout

    try {
      await writeMachineValues({
        commandId,
        subsystem,
        pulse,
        values,
      });
    } catch (e) {
      subsystemResolvers[subsystem] = null;
      throw e;
    }
    await new Promise((resolve, reject) => {
      const watchKittyTimeout = setTimeout(() => {
        delete subsystemResolvers[subsystem];
        const commandErrorTimeMS = Date.now();
        const errorDetails = {
          ..._kitchenState,
          code: 'WatchKittyTimeout',
          command,
          commandId,
          subsystem,
          pulse,
          values,
          commandStartTimeMS,
          commandErrorTimeMS,
          commandDurationMS: commandErrorTimeMS - commandStartTimeMS,
        };
        error('MachineCommandFailed', errorDetails);
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
          const commandErrorTimeMS = Date.now();
          error('MachineCommandFailed', {
            ..._kitchenState,
            code: err.message,
            details: err.details,
            command,
            commandId,
            subsystem,
            pulse,
            values,
            commandStartTimeMS,
            commandErrorTimeMS,
            commandDurationMS: commandErrorTimeMS - commandStartTimeMS,
          });
          reject(err);
        },
        commandId,
        command,
      };
    });

    const commandEndTimeMS = Date.now();

    log('MachineCommandEnd', {
      commandId,
      commandEndTimeMS,
      commandStartTimeMS,
      commandDurationMS: commandEndTimeMS - commandStartTimeMS,
      command,
    });
    return command;
  }

  let _restaurantState = null;
  let _kitchenConfig = null;
  let currentStepPromises = {};

  function observeSideEffects() {
    if (!_restaurantState || !_kitchenState) {
      return;
    }
    const sideEffectActions = computeSideEffects(
      _kitchenState,
      _restaurantState,
    );
    if (
      sideEffectActions &&
      sideEffectActions.length &&
      _restaurantState.isAttached
    ) {
      log('MachineEffects', {
        actions: sideEffectActions,
      });
      let promise = Promise.resolve();
      sideEffectActions.forEach(action => {
        promise = promise
          .then(async () => {
            await restaurantStateDispatch(action);
          })
          .catch(error => {
            error('SideEffectPerformError', {
              error,
              action,
            });
          });
      });
    }
  }

  let lastAppliedMachineState = {};

  function applyDerivedState(restaurantState) {
    if (!deriveAppliedMachineState) return;
    if (!restaurantState.isAttached) return;
    const machineState = deriveAppliedMachineState(restaurantState);
    const newMachineState = {};
    let needsMachineWrite = false;
    Object.entries(machineState).forEach(([k, v]) => {
      if (v == null) {
        // this value is explicitly not being set anymore
      } else if (lastAppliedMachineState[k] !== v) {
        newMachineState[k] = v;
        needsMachineWrite = true;
      }
    });
    if (!needsMachineWrite) {
      return;
    }
    writeTags(newMachineState)
      .then(() => {
        log('WroteMachineValues', newMachineState);
      })
      .catch(e => {
        error('MachineValueWriteError', {
          values: newMachineState,
          code: e.message,
        });
      });

    lastAppliedMachineState = {
      ...lastAppliedMachineState,
      ...newMachineState,
    };
    // return machineState
  }

  function updateCloudValues(kitchenConfig, restaurantState) {
    if (restaurantState !== undefined) _restaurantState = restaurantState;
    if (kitchenConfig !== undefined) _kitchenConfig = kitchenConfig;
    observeSideEffects();
    scheduleSequencerStep();
    applyDerivedState(restaurantState);
  }

  let scheduledSequencerStep = null;

  function scheduleSequencerStep() {
    clearTimeout(scheduledSequencerStep);
    scheduledSequencerStep = setTimeout(handleSequencerStep, 5);
  }

  function handleSequencerStep() {
    if (!_restaurantState) {
      error('SequencerError', { code: 'MissingRestaurantState' });
      return;
    }
    if (!_kitchenState) {
      error('SequencerError', { code: 'MissingKitchenState' });
      return;
    }
    if (!_kitchenConfig) {
      error('SequencerError', { code: 'MissingKitchenConfig' });
      return;
    }
    if (!_kitchenState.isPLCConnected) return; // machine must be attached
    if (!_restaurantState.isAutoRunning) return; // the sequencer only goes when it is "running"
    if (!_restaurantState.isAttached) return; // the sequencer only goes when it is "attached"

    const nextSteps = computeNextSteps(
      sequencerSteps,
      _restaurantState,
      _kitchenConfig,
      _kitchenState,
      commands,
    );

    const stepToStart = nextSteps.find(nextStep => {
      if (!nextStep.isReady) {
        return false;
      }
      const commandType =
        nextStep.command && commands[nextStep.command.commandType];
      const subsystem =
        (commandType && commandType.subsystem) || 'UnknownSystem';
      if (subsystem && currentStepPromises[subsystem]) {
        return false;
      }
      return true;
    });

    if (stepToStart) {
      const commandType =
        stepToStart.command && commands[stepToStart.command.commandType];
      const subsystem =
        (commandType && commandType.subsystem) || 'UnknownSystem';

      log('StepStart', {
        description: stepToStart.description,
        command: stepToStart.command,
      });

      currentStepPromises[subsystem] = stepToStart.perform(
        restaurantStateDispatch,
        runCommand,
      );

      currentStepPromises[subsystem]
        .then(() => {
          currentStepPromises[subsystem] = null;
          log('StepComplete', {
            description: stepToStart.description,
            command: stepToStart.command,
          });
          scheduleSequencerStep();
        })
        .catch(e => {
          currentStepPromises[subsystem] = null;
          error('StepError', {
            code: e.message,
            stepDescription: stepToStart.description,
            command: stepToStart.command,
          });
          // something went wrong, but the sequencer is still meant to run:
          scheduleSequencerStep();
        });
    }
  }

  const sequencerStateStream = combineStreams({
    restaurantState: restaurantStateStream,
    kitchenConfig: configStream,
  });
  const sequencerStateStreamListener = {
    next: ({ restaurantState, kitchenConfig }) => {
      updateCloudValues(kitchenConfig, restaurantState);
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
    runCommand,
    close,
    writeMachineValues,
  };
}
