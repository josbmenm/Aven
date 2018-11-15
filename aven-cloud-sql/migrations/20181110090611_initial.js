exports.up = function(knex, Promise) {
  return knex.schema
    .createTable("domains", table => {
      table.string("name");
      table.unique("name");
    })
    .createTable("objects", table => {
      table.string("id");
      table.string("value");
      table.integer("size");
      table.unique("id");
    })
    .createTable("refs", table => {
      table
        .string("domain")
        .references("name")
        .inTable("domains");
      table.string("name");
      table
        .string("id")
        .references("id")
        .inTable("objects");
      table.unique(["domain", "name"]);
    })
    .createTable("ref_ownership", table => {
      table
        .string("fromName")
        .references("name")
        .inTable("refs");
      table
        .string("fromDomain")
        .references("domain")
        .inTable("refs");
      table
        .string("to")
        .references("id")
        .inTable("objects");
      table.unique(["fromName", "fromDomain", "to"]);
    })
    .createTable("object_ownership", table => {
      table
        .string("from")
        .references("id")
        .inTable("objects");
      table
        .string("to")
        .references("id")
        .inTable("objects");
      table.unique(["from", "to"]);
    });
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTableIfExists("domains")
    .dropTableIfExists("objects")
    .dropTableIfExists("refs")
    .dropTableIfExists("ref_ownership")
    .dropTableIfExists("object_ownership");
};
