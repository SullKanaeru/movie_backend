const contentBaseModel = require("../models/contentBase");
const seriesModel = require("../models/series");
const moviesModel = require("../models/movies");

// Helper function to parse query parameters
const parseQueryParams = (query) => {
  const filters = {};
  const sort = {};
  const pagination = {};

  // Parse filters
  if (query.type) filters.content_type = query.type;
  if (query.search) filters.search = query.search;
  if (query.film_rating) filters.film_rating = query.film_rating;
  if (query.age_rating) filters.age_rating = query.age_rating;
  if (query.release_year) filters.release_year = parseInt(query.release_year);
  if (query.min_release_date) filters.min_release_date = query.min_release_date;
  if (query.max_release_date) filters.max_release_date = query.max_release_date;
  if (query.status) filters.status = query.status;
  if (query.min_episodes) filters.min_episodes = parseInt(query.min_episodes);
  if (query.max_episodes) filters.max_episodes = parseInt(query.max_episodes);
  if (query.min_seasons) filters.min_seasons = parseInt(query.min_seasons);
  if (query.min_duration) filters.min_duration = parseInt(query.min_duration);
  if (query.max_duration) filters.max_duration = parseInt(query.max_duration);

  // Parse sorting
  if (query.sort_by) sort.field = query.sort_by;
  if (query.sort_order) sort.order = query.sort_order;

  // Parse pagination
  if (query.page) pagination.page = parseInt(query.page);
  if (query.limit) pagination.limit = parseInt(query.limit);

  return { filters, sort, pagination };
};

// CREATE SERIES
const createSeries = async (req, res) => {
  try {
    const {
      title,
      description,
      release_date,
      film_rating,
      thumbnail_url,
      banner_url,
      trailer_url,
      age_rating,
      episode_duration,
      total_seasons,
      total_episodes,
      status,
      next_episode_date,
    } = req.body;

    const [contentBaseId] = await contentBaseModel.create({
      title,
      description,
      release_date,
      film_rating,
      content_type: "series",
      thumbnail_url,
      banner_url,
      trailer_url,
      age_rating,
    });

    const [seriesId] = await seriesModel.create({
      content_base_id: contentBaseId,
      episode_duration,
      total_seasons: total_seasons || 1,
      total_episodes: total_episodes || 0,
      status: status || "upcoming",
      next_episode_date,
    });

    const newSeries = await seriesModel.findByIdWithContent(seriesId);

    res.status(201).json({
      success: true,
      message: "Series created successfully",
      data: newSeries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create series",
      error: error.message,
    });
  }
};

// CREATE MOVIE
const createMovie = async (req, res) => {
  try {
    const {
      title,
      description,
      release_date,
      film_rating,
      thumbnail_url,
      banner_url,
      trailer_url,
      age_rating,
      duration,
    } = req.body;

    const [contentBaseId] = await contentBaseModel.create({
      title,
      description,
      release_date,
      film_rating,
      content_type: "movie",
      thumbnail_url,
      banner_url,
      trailer_url,
      age_rating,
    });

    const [movieId] = await moviesModel.create({
      content_base_id: contentBaseId,
      duration,
    });

    const newMovie = await moviesModel.findByIdWithContent(movieId);

    res.status(201).json({
      success: true,
      message: "Movie created successfully",
      data: newMovie,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create movie",
      error: error.message,
    });
  }
};

// READ ALL CONTENT WITH FILTERS, SEARCH, SORTING, PAGINATION
const getAllContent = async (req, res) => {
  try {
    const { filters, sort, pagination } = parseQueryParams(req.query);
    const { type, search } = req.query;

    let content;
    let totalCount = 0;

    if (type === "series") {
      content = await seriesModel.getAllWithContent(filters, sort, pagination);
      totalCount = await seriesModel.getCount(filters);
    } else if (type === "movie") {
      content = await moviesModel.getAllWithContent(filters, sort, pagination);
      totalCount = await moviesModel.getCount(filters);
    } else if (search) {
      filters.search = search;
      content = await contentBaseModel.getAll(filters, sort, pagination);
      totalCount = await contentBaseModel.getCount(filters);
    } else {
      content = await contentBaseModel.getAll(filters, sort, pagination);
      totalCount = await contentBaseModel.getCount(filters);
    }

    const response = {
      success: true,
      data: content,
      pagination: {
        total: totalCount,
        page: pagination.page || 1,
        limit: pagination.limit || content.length,
        totalPages: pagination.limit
          ? Math.ceil(totalCount / pagination.limit)
          : 1,
      },
      filters: filters,
      sort: sort,
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch content",
      error: error.message,
    });
  }
};

// READ CONTENT BY ID
const getContentById = async (req, res) => {
  try {
    const { id } = req.params;

    const content = await contentBaseModel.findById(id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    let detailedContent;

    if (content.content_type === "series") {
      detailedContent = await seriesModel.findByIdWithContent(
        await getSeriesIdByContentBaseId(id)
      );
    } else {
      detailedContent = await moviesModel.findByIdWithContent(
        await getMovieIdByContentBaseId(id)
      );
    }

    res.json({
      success: true,
      data: detailedContent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch content",
      error: error.message,
    });
  }
};

// UPDATE CONTENT
const updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updated = await contentBaseModel.update(id, updateData);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    const updatedContent = await contentBaseModel.findById(id);

    res.json({
      success: true,
      message: "Content updated successfully",
      data: updatedContent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update content",
      error: error.message,
    });
  }
};

// DELETE CONTENT
const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await contentBaseModel.remove(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    res.json({
      success: true,
      message: "Content deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete content",
      error: error.message,
    });
  }
};

// Helper functions
const getSeriesIdByContentBaseId = async (contentBaseId) => {
  const knex = require("./knex");
  const series = await knex("series")
    .where("content_base_id", contentBaseId)
    .first();
  return series ? series.id_series : null;
};

const getMovieIdByContentBaseId = async (contentBaseId) => {
  const knex = require("./knex");
  const movie = await knex("movies")
    .where("content_base_id", contentBaseId)
    .first();
  return movie ? movie.id_movies : null;
};

module.exports = {
  createSeries,
  createMovie,
  getAllContent,
  getContentById,
  updateContent,
  deleteContent,
};
