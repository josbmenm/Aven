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
