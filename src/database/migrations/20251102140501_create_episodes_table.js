/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("episodes", (table) => {
    table.increments("id_episodes").primary();
    table.integer("series_id").unsigned().notNullable();
    table.integer("season_number").notNullable().defaultTo(1);
    table.integer("episode_number").notNullable();
    table.string("episode_title").notNullable();
    table.text("episode_description");
    table.integer("duration").notNullable();
    table.date("release_date");
    table.string("thumbnail_url");
    table.timestamps(true, true);
    table
      .foreign("series_id")
      .references("id_series")
      .inTable("series")
      .onDelete("CASCADE");
    table.unique(["series_id", "season_number", "episode_number"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("episodes");
};
