const knex = require("./knex");
const series = require("./series");

const TABLE_NAME = "episodes";

const getAllWithSeries = async () => {
  return knex({ e: TABLE_NAME })
    .select(
      "e.id_episodes",
      "e.season_number",
      "e.episode_number",
      "e.episode_title",
      "e.episode_description",
      "e.duration",
      "e.release_date",
      "e.thumbnail_url",
      "e.created_at",
      "s.id_series",
      "s.total_seasons",
      "cb.title as series_title",
      "cb.thumbnail_url as series_thumbnail"
    )
    .join({ s: series.tableName }, "e.series_id", "=", "s.id_series")
    .join(
      { cb: "content_base" },
      "s.content_base_id",
      "=",
      "cb.id_content_base"
    )
    .orderBy(["e.series_id", "e.season_number", "e.episode_number"]);
};

const findBySeriesId = async (seriesId) => {
  return knex({ e: TABLE_NAME })
    .select(
      "e.id_episodes",
      "e.season_number",
      "e.episode_number",
      "e.episode_title",
      "e.episode_description",
      "e.duration",
      "e.release_date",
      "e.thumbnail_url"
    )
    .where("e.series_id", seriesId)
    .orderBy(["e.season_number", "e.episode_number"]);
};

const findBySeriesAndSeason = async (seriesId, seasonNumber) => {
  return knex(TABLE_NAME)
    .where({
      series_id: seriesId,
      season_number: seasonNumber,
    })
    .orderBy("episode_number");
};

const findByIdWithSeries = async (id) => {
  return knex({ e: TABLE_NAME })
    .select(
      "e.id_episodes",
      "e.season_number",
      "e.episode_number",
      "e.episode_title",
      "e.episode_description",
      "e.duration",
      "e.release_date",
      "e.thumbnail_url",
      "e.created_at",
      "s.id_series",
      "cb.title as series_title",
      "cb.description as series_description"
    )
    .join({ s: series.tableName }, "e.series_id", "=", "s.id_series")
    .join(
      { cb: "content_base" },
      "s.content_base_id",
      "=",
      "cb.id_content_base"
    )
    .where("e.id_episodes", id)
    .first();
};

const create = async (data) => {
  const {
    series_id,
    season_number,
    episode_number,
    episode_title,
    episode_description,
    duration,
    release_date,
    thumbnail_url,
  } = data;

  const [episodeId] = await knex(TABLE_NAME).insert({
    series_id,
    season_number,
    episode_number,
    episode_title,
    episode_description,
    duration,
    release_date,
    thumbnail_url,
  });

  await series.incrementEpisodeCount(series_id);

  return episodeId;
};

const getNextEpisodeNumber = async (seriesId, seasonNumber) => {
  const lastEpisode = await knex(TABLE_NAME)
    .where({
      series_id: seriesId,
      season_number: seasonNumber,
    })
    .orderBy("episode_number", "desc")
    .first();

  return lastEpisode ? lastEpisode.episode_number + 1 : 1;
};

module.exports = {
  getAllWithSeries,
  findBySeriesId,
  findBySeriesAndSeason,
  findByIdWithSeries,
  create,
  getNextEpisodeNumber,
  tableName: TABLE_NAME,
};
