const episodesModel = require("../models/episodes");
const seriesModel = require("../models/series");

// CREATE 
const createEpisode = async (req, res) => {
  try {
    const {
      series_id,
      season_number,
      episode_number,
      episode_title,
      episode_description,
      duration,
      release_date,
      thumbnail_url,
    } = req.body;

    let finalEpisodeNumber = episode_number;
    if (!episode_number) {
      finalEpisodeNumber = await episodesModel.getNextEpisodeNumber(
        series_id,
        season_number
      );
    }

    const episodeId = await episodesModel.create({
      series_id,
      season_number,
      episode_number: finalEpisodeNumber,
      episode_title,
      episode_description,
      duration,
      release_date,
      thumbnail_url,
    });

    const newEpisode = await episodesModel.findByIdWithSeries(episodeId);

    res.status(201).json({
      success: true,
      message: "Episode created successfully",
      data: newEpisode,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create episode",
      error: error.message,
    });
  }
};

// READ
const getEpisodesBySeries = async (req, res) => {
  try {
    const { seriesId } = req.params;
    const { season } = req.query;

    let episodes;

    if (season) {
      episodes = await episodesModel.findBySeriesAndSeason(
        seriesId,
        parseInt(season)
      );
    } else {
      episodes = await episodesModel.findBySeriesId(seriesId);
    }

    res.json({
      success: true,
      data: episodes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch episodes",
      error: error.message,
    });
  }
};

// UPDATE
const updateEpisode = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const knex = require("./knex");
    const updated = await knex("episodes")
      .where("id_episodes", id)
      .update({ ...updateData, updated_at: knex.fn.now() });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Episode not found",
      });
    }

    const updatedEpisode = await episodesModel.findByIdWithSeries(id);

    res.json({
      success: true,
      message: "Episode updated successfully",
      data: updatedEpisode,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update episode",
      error: error.message,
    });
  }
};

// DELETE
const deleteEpisode = async (req, res) => {
  try {
    const { id } = req.params;

    const knex = require("./knex");
    const deleted = await knex("episodes").where("id_episodes", id).del();

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Episode not found",
      });
    }

    res.json({
      success: true,
      message: "Episode deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete episode",
      error: error.message,
    });
  }
};

module.exports = {
  createEpisode,
  getEpisodesBySeries,
  updateEpisode,
  deleteEpisode,
};
