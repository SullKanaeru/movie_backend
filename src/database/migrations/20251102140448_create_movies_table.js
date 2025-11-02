/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("movies", (table) => {
    table.increments("id_movies").primary();
    table.integer("content_base_id").unsigned().notNullable();
    table.integer("duration").notNullable();
    table.timestamps(true, true);
    table
      .foreign("content_base_id")
      .references("id_content_base")
      .inTable("content_base")
      .onDelete("CASCADE");
    table.unique("content_base_id");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("movies");
};
