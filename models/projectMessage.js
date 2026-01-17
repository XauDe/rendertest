import mongoose from "mongoose";

const projectMessageSchema = new mongoose.Schema(
  {
    projectSpace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectSpace",
      required: true
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("ProjectMessage", projectMessageSchema);
