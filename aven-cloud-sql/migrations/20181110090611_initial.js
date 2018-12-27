exports.up = function(knex) {
  return knex.schema
    .createTable('domains', table => {
      table.string('name');
      table.unique('name');
    })
    .createTable('blocks', table => {
      table.string('id');
      table.text('value');
      table.integer('size');
      table.unique('id');
    })
    .createTable('docs', table => {
      table.increments('docId');
      table.string('domainName');
      table
        .foreign('domainName')
        .references('name')
        .inTable('domains');
      table.string('name');
      table
        .string('currentBlock')
        .references('id')
        .inTable('blocks');
      table.unique(['domainName', 'name']);
    })
    .createTable('doc_ownership', table => {
      table
        .integer('doc')
        .unsigned()
        .notNullable();
      table
        .foreign('doc')
        .references('docId')
        .inTable('docs');
      table.string('ownedBlock').notNullable();
      table
        .foreign('ownedBlock')
        .references('id')
        .inTable('blocks');
      table.unique(['doc', 'ownedBlock']);
    })
    .createTable('block_ownership', table => {
      table.string('block').notNullable();
      table
        .foreign('block')
        .references('id')
        .inTable('blocks');
      table.string('ownedBlock').notNullable();
      table
        .foreign('ownedBlock')
        .references('id')
        .inTable('blocks');
      table.unique(['block', 'ownedBlock']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('domains')
    .dropTableIfExists('blocks')
    .dropTableIfExists('docs')
    .dropTableIfExists('doc_ownership')
    .dropTableIfExists('block_ownership');
};
