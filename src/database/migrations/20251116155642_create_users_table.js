/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("users", (table) => {
    table.increments("id_user").primary();
    table.string("fullname", 100).notNullable();
    table.string("username", 50).notNullable().unique();
    table.string("email", 100).notNullable().unique();
    table.string("password").notNullable();
    table.string("session_id").nullable();
    table.boolean("is_verified").defaultTo(false);
    table.string("verification_token").nullable();
    table.timestamp("verification_token_expires").nullable();
    table.timestamps(true, true);

    // Index untuk mempercepat query
    table.index(["email"]);
    table.index(["username"]);
    table.index(["session_id"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("users");
};
