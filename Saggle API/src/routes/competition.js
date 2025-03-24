const express = require("express");
const {
  createCompetition,
  getAllCompetitions,
  getCompetitionDatasets,
  joinCompetition,
  getCompetitionDetails
} = require("../controllers/competitionController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create competition (Host only)
router.post("/", authMiddleware, createCompetition);

// Get all competitions
router.get("/", getAllCompetitions);

// Get competition details
router.get("/:id", getCompetitionDetails);

// Get competition datasets
router.get("/:id/datasets", authMiddleware, getCompetitionDatasets);

// Join competition (with age verification)
router.post("/:id/join", authMiddleware, joinCompetition);

module.exports = router;