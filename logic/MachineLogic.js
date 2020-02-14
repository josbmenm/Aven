import { log } from '../logger/logger';

function delay(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export function computeNextSteps(
  kitchenSteps,
  restaurantState,
  kitchenConfig,
  kitchenState,
  machineCommands,
) {
  // if (restaurantState.isAttached) {
  //   const { isFaulted, isRunning } = checkKitchenState(
  //     kitchenState,
  //     kitchenConfig,
  //   );
  //   if (isFaulted || isRunning) {
  //     return null;
  //   }
  // }
  return kitchenSteps
    .map(STEP => {
      const {
        getDescription,
        getStateIntent,
        getMachineReady,
        getKitchenCommand,
        getFailureRestaurantAction,
        getStartingRestaurantAction,
        getSuccessRestaurantAction,
      } = STEP;
      const intent = getStateIntent(restaurantState, kitchenState || {}); // CAREFUL, KITCHEN STATE IS HERE BUT EMPTY
      if (!intent) {
        return false;
      }
      // isMachineReady is used to augment the ready check.. isCommandReady is the main check.
      const isMachineReady =
        kitchenState && getMachineReady
          ? getMachineReady(kitchenState, intent)
          : true;
      const rawKitchenCommand = getKitchenCommand(intent, kitchenState || {}); // CAREFUL, KITCHEN STATE IS HERE BUT EMPTY

      const command = rawKitchenCommand && {
        ...rawKitchenCommand,
        context: { ...(rawKitchenCommand.context || {}), intent },
      };

      const commandType = command && machineCommands[command.commandType];
      if (!commandType) {
        console.log(rawKitchenCommand);
      }
      const isSystemIdle =
        kitchenState && commandType
          ? kitchenState[`${commandType.subsystem}_PrgStep_READ`] === 0
          : true;
      const isSystemNotFaulted =
        kitchenState && commandType
          ? kitchenState[`${commandType.subsystem}_NoFaults_READ`] === true
          : true;
      const commandPermissive =
        kitchenState && command
          ? commandType.checkReady(kitchenState, command)
          : true;
      const isCommandReady =
        !!command && isSystemNotFaulted && isSystemIdle && commandPermissive;
      const successRestaurantAction =
        getSuccessRestaurantAction && getSuccessRestaurantAction(intent);
      const failureRestaurantAction =
        getFailureRestaurantAction && getFailureRestaurantAction(intent);
      const startingRestaurantAction =
        getStartingRestaurantAction && getStartingRestaurantAction(intent);
      return {
        intent,
        command,
        isMachineReady,
        isCommandReady,
        isSystemIdle,
        isSystemNotFaulted,
        isReady: !command || (isMachineReady && isCommandReady),
        successRestaurantAction,
        failureRestaurantAction,
        startingRestaurantAction,
        subsystem: command && command.subsystem,
        description: getDescription(intent),
        perform: async (restaurantStateDispatch, runCommand) => {
          let resp = null;

          startingRestaurantAction &&
            (await restaurantStateDispatch(startingRestaurantAction));
          try {
            if (command) {
              resp = await runCommand({
                ...command,
                context: {
                  ...(command.context || {}),
                  via: 'Sequencer',
                  intent,
                },
              });
            }
            successRestaurantAction &&
              (await restaurantStateDispatch(successRestaurantAction));
          } catch (e) {
            log('MachineCommandFailure', {
              intent,
              failureRestaurantAction,
              command,
              code: e.message,
            });
            failureRestaurantAction &&
              (await restaurantStateDispatch(failureRestaurantAction));
            throw e;
          }
          await delay(30); // make sure the results of one action is reflected before the next step is chosen. without this delay we are prone tou double-blending and double-dispensing

          return resp;
        },
        performFake: async restaurantStateDispatch => {
          log('FakeSequencerCommand', {
            intent,
            command,
            failureRestaurantAction,
            startingRestaurantAction,
            successRestaurantAction,
          });
          startingRestaurantAction &&
            (await restaurantStateDispatch(startingRestaurantAction));
          await delay(1000);
          successRestaurantAction &&
            (await restaurantStateDispatch(successRestaurantAction));
          await delay(30);

          return null;
        },
      };
    })
    .filter(Boolean);
}

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
    KitchenSlots,
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
    const slots = [];
    Object.values(KitchenSlots)
      .filter(slot => {
        return slot.KitchenSystem[0] === kitchenSystemId;
      })
      .forEach(slot => {
        slots[slot.Slot] = {
          id: slot.id,
          name: slot.Name,
        };
      });
    const tags = Object.values(KitchenSystemTags).filter(tag => {
      return tag.System[0] === kitchenSystemId;
    });
    const systemFaults = Object.values(KitchenSystemFaults).filter(
      f => f.System[0] === kitchenSystemId,
    );
    const faults = systemFaults.map(faultRow => ({
      id: faultRow.id,
      description: faultRow.Name,
      bitIndex: faultRow['Fault Bit'],
      intIndex: faultRow['Fault Integer'],
    }));
    const systemAlarms = Object.values(KitchenSystemAlarms).filter(
      a => a.System[0] === kitchenSystemId,
    );
    const alarms = systemAlarms.map(row => ({
      id: row.id,
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
    if (kitchenSystem.FillSystemSlotCount) {
      for (
        let slotIndex = 0;
        slotIndex < kitchenSystem.FillSystemSlotCount;
        slotIndex += 1
      ) {
        readTags[`Slot_${slotIndex}_Error`] = {
          name: `Slot_${slotIndex}_Error`,
          type: 'integer',
          subTag: `Slot[${slotIndex}].SlotState.Error`,
        };
        readTags[`Slot_${slotIndex}_IsLow`] = {
          name: `Slot_${slotIndex}_IsLow`,
          type: 'boolean',
          subTag: `Slot[${slotIndex}].SlotState.IsLow`,
        };
        readTags[`Slot_${slotIndex}_DispensedSinceLow`] = {
          name: `Slot_${slotIndex}_DispensedSinceLow`,
          type: 'integer',
          subTag: `Slot[${slotIndex}].SlotState.DispensedSinceLow.ACC`,
        };
      }
    }
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
      slots,
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

function mapObject(inObj, mapper) {
  return Object.fromEntries(
    Object.entries(inObj).map(([k, v]) => {
      return [k, mapper(v, k)];
    }),
  );
}

export function getSubsystemAlarms(system, kitchenState) {
  // copy-pasted from getSubsystemFaults!!
  let alarms = null;

  if (kitchenState[`${system.name}_NoAlarms_READ`] === false) {
    // system has alarming behavior
    alarms = [];
    let alarmsUnreadable;
    const alarmed = Array(4)
      .fill(0)
      .map((_, alarmIntIndex) => {
        if (!kitchenState[`${system.name}_Alarm${alarmIntIndex}_READ`]) {
          return Array(16).fill(0);
        }
        try {
          return kitchenState[`${system.name}_Alarm${alarmIntIndex}_READ`]
            .toString(2)
            .split('')
            .reverse()
            .map(v => v === '1');
        } catch (e) {
          alarmsUnreadable = true;
          return false;
        }
      });

    alarmsUnreadable && alarms.push(`Unable to read alarms of ${system.name}`);

    system.alarms &&
      system.alarms.forEach(f => {
        const faultDintArray = alarmed[f.intIndex];
        const isAlarmed = faultDintArray && faultDintArray[f.bitIndex];
        if (isAlarmed) {
          alarms.push(f.description);
        }
      });
  }
  if (alarms && !alarms.length) {
    alarms.push('Unknown Alarm');
  }
  return alarms;
}

export function getSubsystemFaults(system, kitchenState) {
  let faults = null;

  if (kitchenState[`${system.name}_NoFaults_READ`] === false) {
    // system has faulting behavior
    faults = [];
    let faultsUnreadable;
    const faulted = Array(4)
      .fill(0)
      .map((_, faultIntIndex) => {
        if (!kitchenState[`${system.name}_Fault${faultIntIndex}_READ`]) {
          return Array(16).fill(0);
        }
        try {
          return kitchenState[`${system.name}_Fault${faultIntIndex}_READ`]
            .toString(2)
            .split('')
            .reverse()
            .map(v => v === '1');
        } catch (e) {
          faultsUnreadable = true;
          return false;
        }
      });

    faultsUnreadable && faults.push(`Unable to read faults of ${system.name}`);
    if (faulted[0][0]) {
      faults.push(
        'Watchdog timout on step ' +
          kitchenState[`${system.name}_WatchDogFrozeAt_READ`],
      );
    }
    system.faults &&
      system.faults.forEach(f => {
        const faultDintArray = faulted[f.intIndex];
        const isFaulted = faultDintArray && faultDintArray[f.bitIndex];
        if (isFaulted) {
          faults.push({
            description: f.description,
            airtableId: f.id,
            bitIndex: f.bitIndex,
            intIndex: f.intIndex,
          });
        }
      });
  }
  if (kitchenState[`${system.name}_Homed_READ`] === false) {
    if (!faults) {
      faults = [{ description: 'Not Homed' }];
    } else if (!faults.length) {
      faults.push({ description: 'Not Homed' });
    }
  }
  if (faults && !faults.length) {
    faults.push({
      description: 'Unknown Fault',
    });
  }
  return faults;
}

export const getSubsystem = (subsystemName, kitchenConfig, kitchenState) => {
  if (!kitchenConfig || !kitchenState) {
    return null;
  }
  const ss = kitchenConfig.subsystems[subsystemName];
  if (!ss) {
    return null;
  }
  const reads = mapObject(ss.readTags, (tag, tagName) => {
    const internalTagName = `${subsystemName}_${tagName}_READ`;
    const value = kitchenState[internalTagName];
    const read = { ...tag, value, name: tagName };
    return read;
  });
  const valueCommands = mapObject(
    ss.valueCommands,
    (commandedValues, tagName) => {
      const internalTagName = `${subsystemName}_${tagName}_VALUE`;
      const value = kitchenState[internalTagName];
      const outCmd = { ...commandedValues, value, name: tagName };
      return outCmd;
    },
  );
  const noFaults = reads.NoFaults ? reads.NoFaults.value : null;
  return {
    icon: ss.icon,
    valueCommands,
    pulseCommands: ss.pulseCommands,
    name: subsystemName,
    noFaults,
    reads,
    faults: ss.faults,
    alarms: ss.alarms,
  };
};

export const getSubsystemOverview = (kitchenConfig, kitchenState) => {
  if (!kitchenConfig || !kitchenState) {
    return [];
  }
  return Object.keys(kitchenConfig.subsystems).map(subsystemName => {
    return getSubsystem(subsystemName, kitchenConfig, kitchenState);
  });
};
