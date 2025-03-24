const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

// 1. Create Competition
const createCompetition = async (req, res) => {
  const {
    title,
    hostId,
    startTime,
    endTime,
    maxAge,
    rules,
    algorithm,
    trainData,
    testData,
    demoFile,
    idealData,
  } = req.body;

  try {
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
        idealData,
      },
    });
    res.json(competition);
  } catch (error) {
    res.status(500).json({ error: "Failed to create competition" });
  }
};

// 2. Get All Competitions
const getAllCompetitions = async (req, res) => {
  try {
    const competitions = await prisma.competition.findMany({
      select: {
        id: true,
        title: true,
        hostId: true,
        startTime: true,
        endTime: true,
        maxAge: true,
        algorithm: true,
        _count: {
          select: { submissions: true }
        }
      }
    });
    res.json(competitions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch competitions" });
  }
};

// 3. Get Competition Datasets
const getCompetitionDatasets = async (req, res) => {
  const { id } = req.params;

  try {
    const competition = await prisma.competition.findUnique({
      where: { id: parseInt(id) },
      select: { trainData: true, testData: true, demoFile: true }
    });

    if (!competition) {
      return res.status(404).json({ error: "Competition not found" });
    }

    // Generate pre-signed URLs for secure downloads
    const datasets = {
      trainData: s3.getSignedUrl("getObject", {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: competition.trainData,
        Expires: 3600 // 1 hour expiry
      }),
      testData: s3.getSignedUrl("getObject", {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: competition.testData,
        Expires: 3600
      }),
      demoFile: s3.getSignedUrl("getObject", {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: competition.demoFile,
        Expires: 3600
      })
    };

    res.json(datasets);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch datasets" });
  }
};

// 4. Join Competition (with Age Verification)
const joinCompetition = async (req, res) => {
  const { id } = req.params;
  const { userId, idProofUrl } = req.body;

  try {
    // Verify competition exists
    const competition = await prisma.competition.findUnique({
      where: { id: parseInt(id) }
    });

    if (!competition) {
      return res.status(404).json({ error: "Competition not found" });
    }

    // Call FastAPI age verification service
    const response = await axios.post(
      "https://a444b771-89b3-4d76-b548-6812b247d0c7-00-wrl1ybn6887q.sisko.replit.dev/",
      { image_url: idProofUrl }
    );

    // Check age requirement
    if (response.data.age > competition.maxAge) {
      return res.status(403).json({ 
        error: `Age requirement not met (Max: ${competition.maxAge})`
      });
    }

    // Register participant
    await prisma.participant.create({
      data: {
        userId: parseInt(userId),
        competitionId: parseInt(id)
      }
    });

    res.json({ 
      success: true,
      message: "Successfully joined competition",
      datasets: {
        trainData: competition.trainData,
        testData: competition.testData,
        demoFile: competition.demoFile
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to join competition",
      details: error.message 
    });
  }
};

// 5. Get Competition Details
const getCompetitionDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const competition = await prisma.competition.findUnique({
      where: { id: parseInt(id) },
      include: {
        host: {
          select: { email: true }
        },
        _count: {
          select: { participants: true, submissions: true }
        }
      }
    });

    if (!competition) {
      return res.status(404).json({ error: "Competition not found" });
    }

    res.json(competition);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch competition details" });
  }
};

module.exports = {
  createCompetition,
  getAllCompetitions,
  getCompetitionDatasets,
  joinCompetition,
  getCompetitionDetails
};