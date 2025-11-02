const knex = require("./knex");
const contentBase = require("./contentBase");

const TABLE_NAME = "movies";

const getAllWithContent = async () => {
  return knex({ m: TABLE_NAME })
    .select(
      "m.id_movies",
      "m.duration",
      "m.created_at",
      "cb.id_content_base",
      "cb.title",
      "cb.description",
      "cb.release_date",
      "cb.film_rating",
      "cb.thumbnail_url",
      "cb.banner_url",
      "cb.trailer_url",
      "cb.age_rating"
    )
    .join(
      { cb: contentBase.tableName },
      "m.content_base_id",
      "=",
      "cb.id_content_base"
    )
    .orderBy("cb.release_date", "desc");
};

const findByIdWithContent = async (id) => {
  return knex({ m: TABLE_NAME })
    .select(
      "m.id_movies",
      "m.duration",
      "m.created_at",
      "cb.id_content_base",
      "cb.title",
      "cb.description",
      "cb.release_date",
      "cb.film_rating",
      "cb.thumbnail_url",
      "cb.banner_url",
      "cb.trailer_url",
      "cb.age_rating"
    )
    .join(
      { cb: contentBase.tableName },
      "m.content_base_id",
      "=",
      "cb.id_content_base"
    )
    .where("m.id_movies", id)
    .first();
};

const findByDurationRange = async (minDuration, maxDuration) => {
  return knex({ m: TABLE_NAME })
    .select("m.id_movies", "m.duration", "cb.title", "cb.thumbnail_url")
    .join(
      { cb: contentBase.tableName },
      "m.content_base_id",
      "=",
      "cb.id_content_base"
    )
    .whereBetween("m.duration", [minDuration, maxDuration])
    .orderBy("m.duration");
};

const create = async (data) => {
  const { content_base_id, duration } = data;

  return knex(TABLE_NAME).insert({
    content_base_id,
    duration,
  });
};

module.exports = {
  getAllWithContent,
  findByIdWithContent,
  findByDurationRange,
  create,
  tableName: TABLE_NAME,
};
