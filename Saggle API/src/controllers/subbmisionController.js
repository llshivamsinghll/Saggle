const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const AWS = require("aws-sdk");
const redisClient = require("../utils/redis");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Helper function to calculate evaluation metrics
const calculateScore = (algorithm, idealValues, submissionValues) => {
  switch (algorithm) {
    case "RMSE":
      let sum = 0;
      for (let i = 0; i < idealValues.length; i++) {
        sum += Math.pow(idealValues[i] - submissionValues[i], 2);
      }
      return Math.sqrt(sum / idealValues.length);

    case "Accuracy":
      let correct = 0;
      for (let i = 0; i < idealValues.length; i++) {
        if (idealValues[i] === submissionValues[i]) correct++;
      }
      return correct / idealValues.length;

    case "AUC-ROC":
      // Implement AUC-ROC calculation (e.g., using a library like `ml-stat`)
      return 0.85; // Placeholder

    case "F1":
      // Implement F1 Score calculation
      const precision = calculateScore("Precision", idealValues, submissionValues);
      const recall = calculateScore("Recall", idealValues, submissionValues);
      return (2 * precision * recall) / (precision + recall);

    case "Precision":
      let truePositives1 = 0;
      let falsePositives = 0;
      for (let i = 0; i < idealValues.length; i++) {
        if (submissionValues[i] === 1) {
          if (idealValues[i] === 1) truePositives1++;
          else falsePositives1++;
        }
      }
      return truePositives1 / (truePositives1 + falsePositives);

    case "Recall":
      let truePositives2 = 0;
      let falseNegatives = 0;
      for (let i = 0; i < idealValues.length; i++) {
        if (idealValues[i] === 1) {
          if (submissionValues[i] === 1) truePositives2++;
          else falseNegatives++;
        }
      }
      return truePositives2 / (truePositives2 + falseNegatives);

    default:
      throw new Error("Invalid algorithm");
  }
};

const submitSolution = async (req, res) => {
  const { competitionId, userId } = req.body;
  const filePath = req.file.location; // S3 file URL

  // Fetch competition details
  const competition = await prisma.competition.findUnique({
    where: { id: parseInt(competitionId) },
  });

  if (!competition) {
    return res.status(404).json({ error: "Competition not found" });
  }

  // Fetch ideal dataset from S3
  const idealData = await s3
    .getObject({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: competition.idealData,
    })
    .promise();

  // Fetch submission data from S3
  const submissionData = await s3
    .getObject({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: filePath,
    })
    .promise();

  const idealValues = JSON.parse(idealData.Body.toString());
  const submissionValues = JSON.parse(submissionData.Body.toString());

  // Calculate score based on the selected algorithm
  const score = calculateScore(competition.algorithm, idealValues, submissionValues);

  // Save submission to database
  const submission = await prisma.submission.create({
    data: { competitionId, userId, filePath, score },
  });

  // Update leaderboard in Redis
  await redisClient.zAdd(`leaderboard:${competitionId}`, [
    { score, value: userId.toString() },
  ]);

  res.json(submission);
};

module.exports = { submitSolution };