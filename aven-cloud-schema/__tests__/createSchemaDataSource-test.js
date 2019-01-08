import createSchemaDataSource from '../createSchemaDataSource';
import startMemoryDataSource from '../../aven-cloud/startMemoryDataSource';

describe('schema validation on memory data source', () => {
  test.skip('basic validation', async () => {
    const dataSource = startMemoryDataSource({
      domain: 'test',
    });
    const schemaDs = createSchemaDataSource({ dataSource });
    await dataSource.dispatch({
      type: 'PutDoc',
    });
  });
});
