const express = require("express");
const { createCompetition } = require("../controllers/competitionController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createCompetition);

module.exports = router;