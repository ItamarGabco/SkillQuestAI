import mongoose from "mongoose";

const userTopicSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 60,
    },
    normalizedName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

userTopicSchema.index({ userId: 1, normalizedName: 1 }, { unique: true });

export default mongoose.models.UserTopic ||
  mongoose.model("UserTopic", userTopicSchema);
