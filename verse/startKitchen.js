const { Controller, Tag, EthernetIP, TagGroup } = require('ethernet-ip');
const { INT, BOOL } = EthernetIP.CIP.DataTypes.Types;

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

export const getTagOfSchema = tagSchema => {
  return new Tag(
    tagSchema.tag,
    tagSchema.program,
    getTypeOfSchema(tagSchema.type),
  );
};

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
  Object.keys(values).forEach(valueName => {
    const valueSpec = valueCommands[valueName];
    if (!valueSpec) {
      throw new Error('Invalid value name: ' + valueName);
    }
    const internalTagName = `${systemName}_${valueName}_VALUE`;
    // immediateOutput[internalTagName] = values[valueName];
    tagOutput[internalTagName] = values[valueName];
  });

  // actionId
  if (actionId != null) {
    tagOutput[`${systemName}_ActionIdIn_VALUE`] = actionId;
    // immediateOutput[`${systemName}_ActionIdIn_VALUE`] = actionId;
  }
  if (systemName === 'System') {
    tagOutput = {};
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
            console.error(
              'Failed to read tags. Retrying with debug read.',
              err,
            );
            // failed to read all the tags.. read each individually to see which fail, and report the result
            slowDebugRead()
              .then(failedTags => {
                console.error(
                  `Failing to read tags quickly! On slow read, ${
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

  async function connectKitchenClient() {
    client.get('OnoState^RestaurantConfig').observeValue.subscribe({
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
          const readings = await doReadTags(mainRobotSchema, {});
          isPLCConnected = true;
          currentState = getTagValues(readings);
        }
      } catch (e) {
        isPLCConnected = false;
      }
      if (shallowEqual(lastState, currentState)) {
        // the state doesn't appear to be changing. cool off and wait a 1/4 sec..
        await delay(250);
        return;
      }
      await stateRef.put({
        ...currentState,
        isPLCConnected,
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
      actionId: action.actionId,
    });
    await writeTags(mainRobotSchema, tagOutput);
    await writeTags(mainRobotSchema, immediateOutput);
    await delay(300);
    await writeTags(mainRobotSchema, clearPulseOutput);
    return { ...immediateOutput, ...clearPulseOutput, ...(tagOutput || {}) };
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
