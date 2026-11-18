import { Router } from "express";

import User from "../models/User.js";
import Skill from "../models/Skill.js";
import QuestAttempt from "../models/QuestAttempt.js";

import { requireAuth, requireAdmin } from "./auth.mjs";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/overview", async (req, res) => {
  const [usersCount, skillsCount, completedQuestsCount, recentUsers] =
    await Promise.all([
      User.countDocuments(),
      Skill.countDocuments(),
      QuestAttempt.countDocuments({ status: "completed" }),

      User.find()
        .select("name email role createdAt")
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
    ]);

  res.json({
    stats: {
      usersCount,
      skillsCount,
      completedQuestsCount,
    },

    users: recentUsers.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role || "user",
      createdAt: user.createdAt,
    })),
  });
});

export default router;
