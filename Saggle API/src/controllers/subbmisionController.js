const { evaluate } = require('../services/evaluationService');
const redisClient = require('../utils/redis');

const submitSolution = async (req, res) => {
  const { competitionId, userId } = req.body;
  const file = req.file;

  try {
    // 1. Evaluate submission
    const score = await evaluate(file, competitionId);
    
    // 2. Store submission
    const submission = await prisma.submission.create({
      data: {
        competitionId,
        userId,
        filePath: file.location,
        score
      }
    });

    // 3. Update leaderboard
    await redisClient.zAdd(`leaderboard:${competitionId}`, [
      { score, value: userId.toString() }
    ]);

    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: "Evaluation failed" });
  }
};

module.exports = { submitSolution };