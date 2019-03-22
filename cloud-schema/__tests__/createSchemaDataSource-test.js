import createSchemaDataSource from '../createSchemaDataSource';
import createMemoryDataSource from '../../aven-cloud/createMemoryDataSource';

describe('schema validation on memory data source', () => {
  test.skip('basic validation', async () => {
    const dataSource = createMemoryDataSource({
      domain: 'test',
    });
    const schemaDs = createSchemaDataSource({ dataSource });
    await dataSource.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo/_schema',
      value: {
        self: {
          $schema: 'http://json-schema.org/draft-07/schema#',
          title: 'FooPerson',
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: "The person's name.",
            },
            age: {
              description:
                'Age in years which must be equal to or greater than zero.',
              type: 'integer',
              minimum: 0,
            },
          },
        },
      },
    });

    expect(
      schemaDs.dispatch({
        type: 'PutDocValue',
        domain: 'test',
        name: 'foo',
        value: { invalid: 'person' },
      })
    ).rejects.toThrow();

    await schemaDs.dispatch({
      type: 'PutDocValue',
      domain: 'test',
      name: 'foo',
      value: { name: 'Sean', age: 99 },
    });
  });
});
