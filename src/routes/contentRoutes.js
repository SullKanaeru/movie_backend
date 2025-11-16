const express = require("express");
const router = express.Router();
const contentController = require("../controllers/contentController");
const episodesController = require("../controllers/episodesController");
const { authMiddleware } = require("../middleware/authMiddleware");

// Content Routes
router.post("/series", authMiddleware, contentController.createSeries);
router.post("/movies", authMiddleware, contentController.createMovie);
router.get("/", authMiddleware, contentController.getAllContent);
router.get("/:id", authMiddleware, contentController.getContentById);
router.put("/:id", authMiddleware, contentController.updateContent);
router.delete("/:id", authMiddleware, contentController.deleteContent);

// Episodes Routes
router.post("/episodes", authMiddleware, episodesController.createEpisode);
router.get(
  "/series/:seriesId/episodes",
  authMiddleware,
  episodesController.getEpisodesBySeries
);
router.put("/episodes/:id", authMiddleware, episodesController.updateEpisode);
router.delete(
  "/episodes/:id",
  authMiddleware,
  episodesController.deleteEpisode
);

module.exports = router;
