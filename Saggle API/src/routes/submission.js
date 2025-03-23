const express = require("express");
const { submitSolution } = require("../controllers/subbmisionController");
const authMiddleware = require("../middleware/authMiddleware");
const uploadMiddleware = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/", authMiddleware, uploadMiddleware.single("file"), submitSolution);

module.exports = router;