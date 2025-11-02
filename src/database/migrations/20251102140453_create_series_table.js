/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("series", (table) => {
    table.increments("id_series").primary();
    table.integer("content_base_id").unsigned().notNullable();
    table.integer("episode_duration"); // dalam menit
    table.integer("total_seasons").defaultTo(1);
    table.integer("total_episodes").defaultTo(0);
    table
      .enum("status", ["ongoing", "completed", "upcoming"])
      .defaultTo("upcoming");
    table.date("next_episode_date");
    table.timestamps(true, true);
    table
      .foreign("content_base_id")
      .references("id_content_base")
      .inTable("content_base")
      .onDelete("CASCADE");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("series");
};
