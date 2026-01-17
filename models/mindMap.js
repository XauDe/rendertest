import mongoose from "mongoose";

const mindmapNodeSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    order: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const mindmapSchema = new mongoose.Schema(
  {
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
      unique: true,
      index: true,
    },

    projectSpace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectSpace",
      required: true,
    },

    nodes: {
      type: [mindmapNodeSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Mindmap", mindmapSchema);
