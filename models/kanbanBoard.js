import mongoose from "mongoose";

const kanbanColumnSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true, // e.g. "todo", "in_progress"
    },

    title: {
      type: String,
      required: true, // UI label
    },

    taskIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
  },
  { _id: false }
);

const kanbanBoardSchema = new mongoose.Schema(
  {
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
      unique: true, // one kanban config per board
    },

    projectSpace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectSpace",
      required: true,
      index: true,
    },

    columns: {
      type: [kanbanColumnSchema],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("KanbanBoard", kanbanBoardSchema);
