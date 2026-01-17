import mongoose from "mongoose";

const projectMemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    role: {
      type: String,
      enum: ["owner", "admin", "member", "viewer"],
      default: "member"
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const projectSpaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    members: {
      type: [projectMemberSchema],
      default: []
    },

    archived: {
      type: Boolean,
      default: false
    },

    visibility: {
      type: String,
      enum: ["private", "public"],
      default: "private"
    },

    settings: {
      type: Object,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

/**
 * Ensure project owner is always a member with role "owner"
 */
projectSpaceSchema.pre("save", function () {
  const ownerExists = this.members.some(
    (member) =>
      member.user.toString() === this.owner.toString() &&
      member.role === "owner"
  );

  if (!ownerExists) {
    this.members.unshift({
      user: this.owner,
      role: "owner"
    });
  }
});


export default mongoose.model("ProjectSpace", projectSpaceSchema);
