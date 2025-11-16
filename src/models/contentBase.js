const knex = require("./knex");

const TABLE_NAME = "content_base";

const getAll = async (filters = {}, sort = {}, pagination = {}) => {
  let query = knex(TABLE_NAME);

  // Apply filters
  if (filters.content_type) {
    query = query.where("content_type", filters.content_type);
  }

  if (filters.film_rating) {
    query = query.where("film_rating", filters.film_rating);
  }

  if (filters.age_rating) {
    query = query.where("age_rating", filters.age_rating);
  }

  if (filters.release_year) {
    query = query.whereRaw("YEAR(release_date) = ?", [filters.release_year]);
  }

  if (filters.min_release_date) {
    query = query.where("release_date", ">=", filters.min_release_date);
  }

  if (filters.max_release_date) {
    query = query.where("release_date", "<=", filters.max_release_date);
  }

  // Apply search
  if (filters.search) {
    query = query.where(function () {
      this.where("title", "like", `%${filters.search}%`).orWhere(
        "description",
        "like",
        `%${filters.search}%`
      );
    });
  }

  // Apply sorting
  const sortField = sort.field || "created_at";
  const sortOrder = sort.order || "desc";
  query = query.orderBy(sortField, sortOrder);

  // Apply pagination
  if (pagination.page && pagination.limit) {
    const offset = (pagination.page - 1) * pagination.limit;
    query = query.offset(offset).limit(pagination.limit);
  } else if (pagination.limit) {
    query = query.limit(pagination.limit);
  }

  return query;
};

const findById = async (id) => {
  return knex(TABLE_NAME).where("id_content_base", id).first();
};

const findByType = async (contentType, filters = {}, sort = {}) => {
  let query = knex(TABLE_NAME).where("content_type", contentType);

  // Apply additional filters
  if (filters.film_rating) {
    query = query.where("film_rating", filters.film_rating);
  }

  if (filters.age_rating) {
    query = query.where("age_rating", filters.age_rating);
  }

  if (filters.release_year) {
    query = query.whereRaw("YEAR(release_date) = ?", [filters.release_year]);
  }

  // Apply sorting
  const sortField = sort.field || "release_date";
  const sortOrder = sort.order || "desc";
  return query.orderBy(sortField, sortOrder);
};

const searchByTitle = async (searchTerm, filters = {}) => {
  let query = knex(TABLE_NAME)
    .where("title", "like", `%${searchTerm}%`)
    .orWhere("description", "like", `%${searchTerm}%`);

  // Apply additional filters
  if (filters.content_type) {
    query = query.where("content_type", filters.content_type);
  }

  return query;
};

const getCount = async (filters = {}) => {
  let query = knex(TABLE_NAME).count("* as total");

  // Apply same filters as getAll
  if (filters.content_type) {
    query = query.where("content_type", filters.content_type);
  }

  if (filters.film_rating) {
    query = query.where("film_rating", filters.film_rating);
  }

  if (filters.search) {
    query = query.where(function () {
      this.where("title", "like", `%${filters.search}%`).orWhere(
        "description",
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
  getCount,
  create,
  update,
  remove,
  tableName: TABLE_NAME,
};
