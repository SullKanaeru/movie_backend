const knex = require("./knex");
const contentBase = require("./contentBase");

const TABLE_NAME = "movies";

const getAllWithContent = async (filters = {}, sort = {}, pagination = {}) => {
  let query = knex({ m: TABLE_NAME })
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
    );

  // Apply filters
  if (filters.min_duration) {
    query = query.where("m.duration", ">=", filters.min_duration);
  }

  if (filters.max_duration) {
    query = query.where("m.duration", "<=", filters.max_duration);
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
  if (sort.field === "duration") {
    query = query.orderBy(`m.${sort.field}`, sortOrder);
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

const findByDurationRange = async (minDuration, maxDuration, filters = {}) => {
  let query = knex({ m: TABLE_NAME })
    .select("m.id_movies", "m.duration", "cb.title", "cb.thumbnail_url")
    .join(
      { cb: contentBase.tableName },
      "m.content_base_id",
      "=",
      "cb.id_content_base"
    )
    .whereBetween("m.duration", [minDuration, maxDuration]);

  // Apply additional filters
  if (filters.film_rating) {
    query = query.where("cb.film_rating", filters.film_rating);
  }

  return query.orderBy("m.duration");
};

const getCount = async (filters = {}) => {
  let query = knex({ m: TABLE_NAME })
    .count("* as total")
    .join(
      { cb: contentBase.tableName },
      "m.content_base_id",
      "=",
      "cb.id_content_base"
    );

  // Apply same filters as getAllWithContent
  if (filters.min_duration) {
    query = query.where("m.duration", ">=", filters.min_duration);
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
  getCount,
  create,
  tableName: TABLE_NAME,
};
