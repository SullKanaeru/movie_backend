const knex = require("./knex");
const contentBase = require("./contentBase");

const TABLE_NAME = "series";

const getAllWithContent = async () => {
  return knex({ s: TABLE_NAME })
    .select(
      "s.id_series",
      "s.episode_duration",
      "s.total_seasons",
      "s.total_episodes",
      "s.status",
      "s.next_episode_date",
      "s.created_at",
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
      "s.content_base_id",
      "=",
      "cb.id_content_base"
    )
    .orderBy("cb.release_date", "desc");
};

const findByIdWithContent = async (id) => {
  return knex({ s: TABLE_NAME })
    .select(
      "s.id_series",
      "s.episode_duration",
      "s.total_seasons",
      "s.total_episodes",
      "s.status",
      "s.next_episode_date",
      "s.created_at",
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
      "s.content_base_id",
      "=",
      "cb.id_content_base"
    )
    .where("s.id_series", id)
    .first();
};

const findByStatus = async (status) => {
  return knex({ s: TABLE_NAME })
    .select(
      "s.id_series",
      "s.status",
      "s.next_episode_date",
      "cb.title",
      "cb.thumbnail_url"
    )
    .join(
      { cb: contentBase.tableName },
      "s.content_base_id",
      "=",
      "cb.id_content_base"
    )
    .where("s.status", status)
    .orderBy("s.next_episode_date", "asc");
};

const create = async (data) => {
  const {
    content_base_id,
    episode_duration,
    total_seasons,
    total_episodes,
    status,
    next_episode_date,
  } = data;

  return knex(TABLE_NAME).insert({
    content_base_id,
    episode_duration,
    total_seasons,
    total_episodes,
    status,
    next_episode_date,
  });
};

const updateStatus = async (id, status, nextEpisodeDate = null) => {
  return knex(TABLE_NAME).where("id_series", id).update({
    status,
    next_episode_date: nextEpisodeDate,
    updated_at: knex.fn.now(),
  });
};

const incrementEpisodeCount = async (id) => {
  return knex(TABLE_NAME).where("id_series", id).increment("total_episodes", 1);
};

module.exports = {
  getAllWithContent,
  findByIdWithContent,
  findByStatus,
  create,
  updateStatus,
  incrementEpisodeCount,
  tableName: TABLE_NAME,
};
