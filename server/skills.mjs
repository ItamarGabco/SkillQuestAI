import { Router } from "express";
import mongoose from "mongoose";

import Skill from "../models/Skill.js";
import QuestAttempt from "../models/QuestAttempt.js";
import { requireAuth } from "./auth.mjs";

const router = Router();

router.use(requireAuth);

function parseSkill(body, isUpdate = false) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "נתוני הסקיל אינם תקינים" };
  }

  const allowedFields = ["name", "category"];

  if (Object.keys(body).some((key) => !allowedFields.includes(key))) {
    return { error: "נשלחו שדות שאינם מותרים לעריכה" };
  }

  const values = {};

  if (!isUpdate || Object.hasOwn(body, "name")) {
    if (typeof body.name !== "string") {
      return { error: "יש להזין שם סקיל" };
    }

    const name = body.name.trim();

    if (!name || name.length > 80) {
      return { error: "שם הסקיל חייב להכיל עד 80 תווים" };
    }

    values.name = name;
  }

  if (Object.hasOwn(body, "category")) {
    if (typeof body.category !== "string") {
      return { error: "הקטגוריה אינה תקינה" };
    }

    const category = body.category.trim();

    if (!category || category.length > 50) {
      return { error: "שם הקטגוריה חייב להכיל עד 50 תווים" };
    }

    values.category = category;
  }

  if (isUpdate && Object.keys(values).length === 0) {
    return { error: "לא נשלחו שדות לעדכון" };
  }

  return { values };
}

function validId(req, res) {
  if (mongoose.isValidObjectId(req.params.id)) {
    return true;
  }

  res.status(400).json({ error: "מזהה סקיל לא תקין" });
  return false;
}

// READ — all skills
router.get("/", async (req, res) => {
  const skills = await Skill.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .lean();

  res.json({ skills });
});

// READ — one skill
router.get("/:id", async (req, res) => {
  if (!validId(req, res)) return;

  const skill = await Skill.findOne({
    _id: req.params.id,
    userId: req.user.id,
  }).lean();

  if (!skill) {
    return res.status(404).json({ error: "הסקיל לא נמצא" });
  }

  res.json({ skill });
});

// CREATE
router.post("/", async (req, res) => {
  const { values, error } = parseSkill(req.body);

  if (error) {
    return res.status(400).json({ error });
  }

  const skill = await Skill.create({
    userId: req.user.id,
    category: "כללי",
    ...values,
  });

  res.status(201).json({ skill });
});

// UPDATE
router.patch("/:id", async (req, res) => {
  if (!validId(req, res)) return;

  const { values, error } = parseSkill(req.body, true);

  if (error) {
    return res.status(400).json({ error });
  }

  const current = await Skill.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!current) {
    return res.status(404).json({ error: "הסקיל לא נמצא" });
  }

  if (values.name && values.name !== current.name) {
    const hasHistory = await QuestAttempt.exists({
      userId: req.user.id,
      skillName: current.name,
    });

    if (hasHistory) {
      return res.status(409).json({
        error: "לא ניתן לשנות שם סקיל עם היסטוריית תרגול",
      });
    }
  }

  current.set(values);
  await current.save();

  res.json({ skill: current });
});

// DELETE
router.delete("/:id", async (req, res) => {
  if (!validId(req, res)) return;

  const skill = await Skill.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!skill) {
    return res.status(404).json({ error: "הסקיל לא נמצא" });
  }

  const hasHistory = await QuestAttempt.exists({
    userId: req.user.id,
    skillName: skill.name,
  });

  if (hasHistory) {
    return res.status(409).json({
      error: "לא ניתן למחוק סקיל עם היסטוריית תרגול כרגע",
    });
  }

  await skill.deleteOne();

  res.status(204).end();
});

export default router;
