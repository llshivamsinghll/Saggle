const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createCompetition = async (req, res) => {
  const {
    title,
    hostId,
    startTime,
    endTime,
    maxAge,
    rules,
    algorithm, // e.g., "RMSE", "Accuracy", "AUC-ROC", "F1", "Precision", "Recall"
    trainData,
    testData,
    demoFile,
    idealData, // New field for ideal dataset
  } = req.body;

  const competition = await prisma.competition.create({
    data: {
      title,
      hostId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      maxAge,
      rules,
      algorithm,
      trainData,
      testData,
      demoFile,
      idealData, // Store ideal dataset path
    },
  });

  res.json(competition);
};

module.exports = { createCompetition };