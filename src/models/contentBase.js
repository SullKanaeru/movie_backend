const knex = require("./knex");

const TABLE_NAME = "content_base";

const getAll = async () => {
  return knex(TABLE_NAME).select("*").orderBy("created_at", "desc");
};

const findById = async (id) => {
  return knex(TABLE_NAME).where("id_content_base", id).first();
};

const findByType = async (contentType) => {
  return knex(TABLE_NAME)
    .where("content_type", contentType)
    .orderBy("release_date", "desc");
};

const searchByTitle = async (searchTerm) => {
  return knex(TABLE_NAME)
    .where("title", "like", `%${searchTerm}%`)
    .orWhere("description", "like", `%${searchTerm}%`);
};

const create = async (data) => {
  const {
    title,
    description,
    release_date,
    film_rating,
    content_type,
    thumbnail_url,
    banner_url,
    trailer_url,
    age_rating,
  } = data;

  return knex(TABLE_NAME).insert({
    title,
    description,
    release_date,
    film_rating,
    content_type,
    thumbnail_url,
    banner_url,
    trailer_url,
    age_rating,
  });
};

const update = async (id, data) => {
  return knex(TABLE_NAME)
    .where("id_content_base", id)
    .update({ ...data, updated_at: knex.fn.now() });
};

const remove = async (id) => {
  return knex(TABLE_NAME).where("id_content_base", id).del();
};

module.exports = {
  getAll,
  findById,
  findByType,
  searchByTitle,
  create,
  update,
  remove,
  tableName: TABLE_NAME,
};
