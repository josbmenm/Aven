const getSqlType = columnType => {
  switch (columnType) {
    case 'shortstring':
      // shortstring , lowercase alphanum, start with letter, dashes ok, not too long
      return 'TEXT';
    case 'json':
      return 'JSON';
    case 'binary':
      return 'BYTEA';
    case 'int':
      return 'INTEGER';
    case 'enum':
      return 'TEXT';
    case 'boolean':
      return 'BOOLEAN';
  }
};
const DBSchema = ({ tables }) => ({ tables });
const TableSchema = ({ columns, primary }) => ({
  type: 'table',
  columns,
  primary,
});
const ColumnSchema = (type, { options, ref } = {}) => ({
  type: 'column',
  columnType: type,
  options,
  ref,
});

const schema = DBSchema({
  tables: {
    domains: TableSchema({
      columns: {
        name: ColumnSchema('shortstring'),
      },
      primary: ['name'],
    }),
    blocks: TableSchema({
      columns: {
        id: ColumnSchema('shortstring'),
        size: ColumnSchema('int'),
        json: ColumnSchema('json'),
        binary: ColumnSchema('binary'),
      },
      primary: ['id'],
    }),
    refs: TableSchema({
      columns: {
        id: ColumnSchema('shortstring'),
        domain: ColumnSchema('shortstring', {
          ref: {
            _table: 'domains',
            domain: 'name',
          },
        }),
        is_public: ColumnSchema('boolean'),
        owner: ColumnSchema('shortstring', {
          ref: {
            _table: 'refs',
            owner: 'id',
            domain: 'domain',
          },
        }),
        active_block: ColumnSchema('shortstring', {
          ref: {
            _table: 'blocks',
            active_block: 'id',
          },
        }),
      },
      primary: ['domain', 'id'],
    }),
    permissions: TableSchema({
      columns: {
        owner: ColumnSchema('shortstring', {
          ref: {
            _table: 'refs',
            _cascadeDelete: true,
            owner: 'id',
            domain: 'domain',
          },
        }),
        ref: ColumnSchema('shortstring', {
          ref: {
            _table: 'refs',
            _cascadeDelete: true,
            ref: 'id',
            domain: 'domain',
          },
        }),
        domain: ColumnSchema('shortstring', {
          ref: {
            _table: 'domains',
            _cascadeDelete: true,
            domain: 'name',
          },
        }),
        permission: ColumnSchema('enum', {
          options: ['read', 'write', 'force', 'admin'],
        }),
      },
      primary: ['ref', 'permission', 'owner', 'domain'],
    }),
    block_refs: TableSchema({
      columns: {
        ref: ColumnSchema('shortstring', {
          ref: {
            _table: 'refs',
            _cascadeDelete: true,
            ref: 'id',
            domain: 'domain',
          },
        }),
        domain: ColumnSchema('shortstring', {
          ref: {
            _table: 'domains',
            _cascadeDelete: true,
            domain: 'name',
          },
        }),
        block: ColumnSchema('shortstring', {
          ref: {
            _table: 'blocks',
            _cascadeDelete: true,
            block: 'id',
          },
        }),
      },
      primary: ['ref', 'block'],
    }),
  },
});

module.exports = { getSqlType, schema, DBSchema, TableSchema, ColumnSchema };
