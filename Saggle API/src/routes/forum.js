const express = require("express");
const { createPost, getPosts, pinPost } = require("../controllers/forumController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createPost);
router.get("/:competitionId", getPosts);
router.patch("/pin/:postId", authMiddleware, pinPost);

module.exports = router;