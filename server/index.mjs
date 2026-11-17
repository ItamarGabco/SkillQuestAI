import express from "express";
import mongoose from "mongoose";

import skillsRouter from "./skills.mjs";

const app = express();
const PORT = Number(process.env.PORT || 4001);

app.disable("x-powered-by");
app.use(express.json({ limit: "16kb" }));

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "SkillQuestAI API",
  });
});

app.use("/api/skills", skillsRouter);

app.use((req, res) => {
  res.status(404).json({
    error: "הנתיב המבוקש אינו קיים",
  });
});

app.use((error, req, res, next) => {
  if (error.code === 11000) {
    return res.status(409).json({
      error: "סקיל בשם זה כבר קיים",
    });
  }

  if (
    error.name === "ValidationError" ||
    error.type === "entity.parse.failed"
  ) {
    return res.status(400).json({
      error: "הנתונים שנשלחו אינם תקינים",
    });
  }

  console.error("Express API error:", error);

  res.status(500).json({
    error: "אירעה שגיאה בשרת",
  });
});

async function startServer() {
  if (!process.env.MONGODB_URI || !process.env.AUTH_SECRET) {
    throw new Error("Missing MONGODB_URI or AUTH_SECRET");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SkillQuestAI API listening on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start Express API:", error);
  process.exit(1);
});
