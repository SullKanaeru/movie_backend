const express = require("express");
const router = express.Router();
const contentController = require("../controllers/contentController");
const episodesController = require("../controllers/episodesController");

// Content Routes
router.post("/series", contentController.createSeries);
router.post("/movies", contentController.createMovie);
router.get("/", contentController.getAllContent);
router.get("/:id", contentController.getContentById);
router.put("/:id", contentController.updateContent);
router.delete("/:id", contentController.deleteContent);

// Episodes Routes
router.post("/episodes", episodesController.createEpisode);
router.get(
  "/series/:seriesId/episodes", 
  episodesController.getEpisodesBySeries
);
router.put("/episodes/:id", episodesController.updateEpisode);
router.delete("/episodes/:id", episodesController.deleteEpisode);

module.exports = router;
