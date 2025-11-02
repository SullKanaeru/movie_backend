const dbConfig = require("../config/database");

const config = dbConfig[process.env.NODE_ENV];

const knex = require("knex")(config);

module.exports = knex;
