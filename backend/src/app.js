require("dotenv").config();
const express = require("express");
const cors = require("cors");
const logRoutes = require("./routes/logRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const authRoutes = require("./routes/authRoutes");
const summaryRoutes = require("./routes/summaryRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS — must come before any routes
const defaultOrigins = [
  "http://localhost:3000",
  "https://log-gpt-delta.vercel.app",
  "https://log-gpt-git-main-sharma-anahitas-projects.vercel.app"
];

const allowedOrigins = process.env.CORS_ORIGIN
  ? [...new Set(process.env.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean))]
  : defaultOrigins;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Render health checks)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        return callback(null, true);
      }
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", port: PORT });
});

// Public routes
app.use("/auth", authRoutes);

// Protected routes
app.use("/logs", logRoutes);
app.use("/sessions", sessionRoutes);
app.use("/sessions", summaryRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[✓] Backend running on port ${PORT}`);
});