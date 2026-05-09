require("dotenv").config(require("path").resolve(__dirname, "../../.env"));
const express = require("express");
const logRoutes = require("./routes/logRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const summaryRoutes = require("./routes/summaryRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/logs", logRoutes);
app.use("/sessions", sessionRoutes);
app.use("/sessions", summaryRoutes); // POST /sessions/:id/summary

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});