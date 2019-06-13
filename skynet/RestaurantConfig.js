import defineCloudFunction from '../cloud-core/defineCloudFunction';
import {
  mainSubsystems,
  sequencerSystemReadTags,
  sequencerSystemPulseCommands,
  sequencerSystemValueCommands,
  getExternalTagName,
} from '../logic/KitchenLogic';

const RestaurantConfig = defineCloudFunction(
  'RestaurantConfig',
  (docState, doc, cloud, getValue) => {
    const atDataDoc = cloud.get('Airtable').expand((folder, doc) => {
      if (!folder) {
        return null;
      }
      return doc.getBlock(folder.files['db.json']);
    });
    const atData = getValue(atDataDoc);

    if (!atData) {
      return null;
    }
    const {
      KitchenSystems,
      KitchenSystemTags,
      KitchenSystemFaults,
    } = atData.baseTables;
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
  },
  'a',
);

export default RestaurantConfig;
