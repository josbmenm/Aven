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
    .createTable('refs', table => {
      table.increments('refId');
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
    .createTable('ref_ownership', table => {
      table
        .integer('ref')
        .unsigned()
        .notNullable();
      table
        .foreign('ref')
        .references('refId')
        .inTable('refs');
      table.string('ownedBlock').notNullable();
      table
        .foreign('ownedBlock')
        .references('id')
        .inTable('blocks');
      table.unique(['ref', 'ownedBlock']);
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
    .dropTableIfExists('refs')
    .dropTableIfExists('ref_ownership')
    .dropTableIfExists('block_ownership');
};
