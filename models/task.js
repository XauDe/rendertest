import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
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

    completed: {
      type: Boolean,
      default: false
    },

    projectSpace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectSpace",
      required: true
    },

    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    assigner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: ["backlog", "todo", "in_progress", "review", "done"],
      default: "todo"
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Task", taskSchema);
