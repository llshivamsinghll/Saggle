const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const competitionRoutes = require("./routes/competition");
const submissionRoutes = require("./routes/submission");
const forumRoutes = require("./routes/forum");
const verificationRoutes = require('./routes/verification');

const app = express();

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Updated CORS configuration
app.use(
  cors({
    origin: 'http://localhost:8080', // Allow only this origin
  })
);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/competitions", competitionRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/forum", forumRoutes);
app.use('/api/verification', verificationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));