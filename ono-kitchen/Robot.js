const { Controller, Tag, EthernetIP, TagGroup } = require('ethernet-ip');
const { INT, BOOL } = EthernetIP.CIP.DataTypes.Types;

const mainPLC = new Controller();

let readyPLC = null;

const PLC_IP = '192.168.1.122';
mainPLC
  .connect(
    PLC_IP,
    0,
  )
  .then(async () => {
    console.log(
      'PLC Connected. (' + mainPLC.properties.name + ' at ' + PLC_IP + ')',
    );

    readyPLC = mainPLC;
  })
  .catch(err => {
    console.error('PLC Connection error!');
    console.error(err);
    throw err;
  });

export const getReadyPLC = async () => {
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

export const createSchema = controllerSchema => {
  const tags = {};
  const allTagsGroup = new TagGroup();
  Object.keys(controllerSchema).forEach(tagAlias => {
    tags[tagAlias] = getTagOfSchema(controllerSchema[tagAlias]);
    allTagsGroup.add(tags[tagAlias]);
  });
  return { config: controllerSchema, tags, allTagsGroup };
};

export const readTags = async (schema, action) => {
  const PLC = await getReadyPLC();
  await PLC.readTagGroup(schema.allTagsGroup);

  const readings = {};

  Object.keys(schema.config).forEach(tagAlias => {
    readings[tagAlias] = {
      ...schema.config[tagAlias],
      value: schema.tags[tagAlias].value,
    };
  });

  return readings;
};

export const writeTags = async (schema, action) => {
  const outputGroup = new TagGroup();

  Object.keys(action.values).forEach(tagAlias => {
    if (
      !controllerSchema[tagAlias] ||
      !controllerSchema[tagAlias].enableOutput
    ) {
      throw new Error(`Output is not configured for "${tagAlias}"`);
    }
    const tag = schema.tags[tagAlias];
    tag.value = action.values[tagAlias];
    outputGroup.add(tag);
  });

  const PLC = await getReadyPLC();
  await PLC.writeTagGroup(outputGroup);
};
