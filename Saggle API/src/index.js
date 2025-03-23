const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const competitionRoutes = require("./routes/competition");
const submissionRoutes = require("./routes/submission");
const forumRoutes = require("./routes/forum");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/competitions", competitionRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/forum", forumRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));