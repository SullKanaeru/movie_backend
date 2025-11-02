const contentBaseModel = require("../models/contentBase");
const seriesModel = require("../models/series");
const moviesModel = require("../models/movies");

// CREATE - Tambah Series Baru
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

    // 1. Buat content_base terlebih dahulu
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

    // 2. Buat series data
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

// CREATE - Tambah Movie Baru
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

    // 1. Buat content_base terlebih dahulu
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

    // 2. Buat movie data
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

// READ - Get All Content
const getAllContent = async (req, res) => {
  try {
    const { type, search } = req.query;

    let content;

    if (type === "series") {
      content = await seriesModel.getAllWithContent();
    } else if (type === "movie") {
      content = await moviesModel.getAllWithContent();
    } else if (search) {
      content = await contentBaseModel.searchByTitle(search);
    } else {
      content = await contentBaseModel.getAll();
    }

    res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch content",
      error: error.message,
    });
  }
};

// READ - Get Content by ID
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

// UPDATE - Update Content
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

// DELETE - Delete Content
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
