import mongoose from "mongoose";

const projectGoalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 150
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000
    },

    dueDate: {
      type: Date
    },

    status: {
      type: String,
      enum: ["upcoming", "completed", "overdue"],
      default: "upcoming"
    },

    projectSpace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectSpace",
      required: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("ProjectGoal", projectGoalSchema);
