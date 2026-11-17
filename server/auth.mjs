import mongoose from "mongoose";
import { jwtVerify } from "jose";
import User from "../models/User.js";

export async function requireAuth(req, res, next) {
  const authorization = req.get("authorization") || "";
  const token = authorization.match(/^Bearer (.+)$/i)?.[1];

  if (!token) {
    return res.status(401).json({
      error: "נדרשת התחברות",
    });
  }

  let userId;

  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    userId = payload.userId;
  } catch {
    return res.status(401).json({
      error: "ההתחברות אינה תקינה או שפג תוקפה",
    });
  }

  if (typeof userId !== "string" || !mongoose.isValidObjectId(userId)) {
    return res.status(401).json({
      error: "משתמש לא תקין",
    });
  }

  const user = await User.findById(userId).select("role").lean();

  if (!user) {
    return res.status(401).json({
      error: "המשתמש אינו קיים",
    });
  }

  req.user = {
    id: userId,
    role: user.role || "user",
  };

  next();
}
