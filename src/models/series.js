const knex = require("./knex");
const contentBase = require("./contentBase");

const TABLE_NAME = "series";

const getAllWithContent = async (filters = {}, sort = {}, pagination = {}) => {
  let query = knex({ s: TABLE_NAME })
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
    );

  // Apply filters
  if (filters.status) {
    query = query.where("s.status", filters.status);
  }

  if (filters.min_episodes) {
    query = query.where("s.total_episodes", ">=", filters.min_episodes);
  }

  if (filters.max_episodes) {
    query = query.where("s.total_episodes", "<=", filters.max_episodes);
  }

  if (filters.min_seasons) {
    query = query.where("s.total_seasons", ">=", filters.min_seasons);
  }

  if (filters.film_rating) {
    query = query.where("cb.film_rating", filters.film_rating);
  }

  if (filters.age_rating) {
    query = query.where("cb.age_rating", filters.age_rating);
  }

  if (filters.release_year) {
    query = query.whereRaw("YEAR(cb.release_date) = ?", [filters.release_year]);
  }

  // Apply search
  if (filters.search) {
    query = query.where(function () {
      this.where("cb.title", "like", `%${filters.search}%`).orWhere(
        "cb.description",
        "like",
        `%${filters.search}%`
      );
    });
  }

  // Apply sorting
  const sortField = sort.field || "cb.release_date";
  const sortOrder = sort.order || "desc";

  // Handle special sorting cases
  if (
    sort.field === "episode_duration" ||
    sort.field === "total_episodes" ||
    sort.field === "total_seasons"
  ) {
    query = query.orderBy(`s.${sort.field}`, sortOrder);
  } else if (
    sort.field === "title" ||
    sort.field === "release_date" ||
    sort.field === "film_rating"
  ) {
    query = query.orderBy(`cb.${sort.field}`, sortOrder);
  } else {
    query = query.orderBy(sortField, sortOrder);
  }

  // Apply pagination
  if (pagination.page && pagination.limit) {
    const offset = (pagination.page - 1) * pagination.limit;
    query = query.offset(offset).limit(pagination.limit);
  } else if (pagination.limit) {
    query = query.limit(pagination.limit);
  }

  return query;
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

const findByStatus = async (status, filters = {}) => {
  let query = knex({ s: TABLE_NAME })
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
    .where("s.status", status);

  // Apply additional filters
  if (filters.film_rating) {
    query = query.where("cb.film_rating", filters.film_rating);
  }

  return query.orderBy("s.next_episode_date", "asc");
};

const getCount = async (filters = {}) => {
  let query = knex({ s: TABLE_NAME })
    .count("* as total")
    .join(
      { cb: contentBase.tableName },
      "s.content_base_id",
      "=",
      "cb.id_content_base"
    );

  // Apply same filters as getAllWithContent
  if (filters.status) {
    query = query.where("s.status", filters.status);
  }

  if (filters.search) {
    query = query.where(function () {
      this.where("cb.title", "like", `%${filters.search}%`).orWhere(
        "cb.description",
        "like",
        `%${filters.search}%`
      );
    });
  }

  const result = await query.first();
  return result.total;
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
  getCount,
  create,
  updateStatus,
  incrementEpisodeCount,
  tableName: TABLE_NAME,
};
