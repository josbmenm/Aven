exports.up = function(knex, Promise) {
  return knex.schema
    .createTable("domains", table => {
      table.string("name");
      table.unique("name");
    })
    .createTable("objects", table => {
      table.string("id");
      table.text("value");
      table.integer("size");
      table.unique("id");
    })
    .createTable("refs", table => {
      table.increments("refId");
      table.string("domainName");
      table
        .foreign("domainName")
        .references("name")
        .inTable("domains");
      table.string("name");
      table
        .string("currentObject")
        .references("id")
        .inTable("objects");
      table.unique(["domainName", "name"]);
    })
    .createTable("ref_ownership", table => {
      table
        .integer("ref")
        .unsigned()
        .notNullable();
      table
        .foreign("ref")
        .references("refId")
        .inTable("refs");
      table.string("ownedObject").notNullable();
      table
        .foreign("ownedObject")
        .references("id")
        .inTable("objects");
      table.unique(["ref", "ownedObject"]);
    })
    .createTable("object_ownership", table => {
      table.string("object").notNullable();
      table
        .foreign("object")
        .references("id")
        .inTable("objects");
      table.string("ownedObject").notNullable();
      table
        .foreign("ownedObject")
        .references("id")
        .inTable("objects");
      table.unique(["object", "ownedObject"]);
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
