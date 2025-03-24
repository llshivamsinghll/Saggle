const axios = require('axios');
const prisma = new (require('@prisma/client').PrismaClient)();

const verifyAge = async (req, res) => {
  const { competitionId, userId, idProofUrl } = req.body;
  
  try {
    // 1. Get competition maxAge
    const competition = await prisma.competition.findUnique({
      where: { id: competitionId }
    });

    // 2. Call FastAPI endpoint
    const response = await axios.post(
      'https://your-fastapi-url/verify-age',
      { image_url: idProofUrl }
    );
    
    // 3. Check age requirement
    if (response.data.age > competition.maxAge) {
      return res.status(403).json({ error: "Age requirement not met" });
    }

    // 4. Register participant
    await prisma.participant.create({
      data: { userId, competitionId }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Age verification failed" });
  }
};

module.exports = { verifyAge };