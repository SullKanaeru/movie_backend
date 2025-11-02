/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("content_base", (table) => {
    table.increments("id_content_base").primary();
    table.string("title").notNullable();
    table.text("description");
    table.date("release_date");
    table.string("film_rating", 10);
    table.enum("content_type", ["movie", "series"]).notNullable();
    table.string("thumbnail_url");
    table.string("banner_url");
    table.string("trailer_url");
    table.string("age_rating", 10);
    table.timestamps(true, true); // created_at, updated_at
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("content_base");
};
