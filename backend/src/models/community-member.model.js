import mongoose from "mongoose";

const communityMemberSchema = new mongoose.Schema(
  {
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: ["member", "moderator", "admin"],
      default: "member",
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },

    lastReadAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

communityMemberSchema.index(
  { community: 1, user: 1 },
  { unique: true }
);

const CommunityMember = mongoose.model(
  "CommunityMember",
  communityMemberSchema
);

export default CommunityMember;