import mongoose from "mongoose";

const communityMessageReceiptSchema = new mongoose.Schema(
  {
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommunityMessage",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

communityMessageReceiptSchema.index(
  { message: 1, user: 1 },
  { unique: true }
);

communityMessageReceiptSchema.index({
  message: 1,
  status: 1,
});

const CommunityMessageReceipt = mongoose.model(
  "CommunityMessageReceipt",
  communityMessageReceiptSchema
);

export default CommunityMessageReceipt;