exports.up = function(knex, Promise) {
  return knex.schema
    .createTable("domains", table => {
      table.string("name");
      table.unique("name");
    })
    .createTable("objects", table => {
      table.string("id");
      table.json("value");
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
    .createTable("object_relations", table => {
      table
        .string("from")
        .references("id")
        .inTable("objects");
      table
        .string("to")
        .references("id")
        .inTable("objects");
    });
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTableIfExists("domains")
    .dropTableIfExists("objects")
    .dropTableIfExists("refs")
    .dropTableIfExists("object_relations");
};
