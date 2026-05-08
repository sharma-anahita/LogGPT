require("dotenv").config(require("path").resolve(__dirname, "../../.env"));
const express = require("express");
const logRoutes = require("./routes/logRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/logs", logRoutes);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
