const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createPost = async (req, res) => {
  const { competitionId, userId, content } = req.body;
  const post = await prisma.post.create({
    data: { competitionId, userId, content },
  });
  res.json(post);
};

const getPosts = async (req, res) => {
  const { competitionId } = req.params;
  const posts = await prisma.post.findMany({
    where: { competitionId },
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(posts);
};

const pinPost = async (req, res) => {
  const { postId } = req.params;
  const post = await prisma.post.update({
    where: { id: parseInt(postId) },
    data: { isPinned: true },
  });
  res.json(post);
};

module.exports = { createPost, getPosts, pinPost };