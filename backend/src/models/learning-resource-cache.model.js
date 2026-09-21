import mongoose from "mongoose";

const learningResourceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 300,
        },

        url: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },

        type: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },

        description: {
            type: String,
            default: "",
            trim: true,
            maxlength: 5000,
        },
    },
    { _id: false }
);

const learningResourceCacheSchema = new mongoose.Schema(
    {
        cacheKey: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        resources: {
            type: [learningResourceSchema],
            default: [],
        },

        expiresAt: {
            type: Date,
            required: true,
        },

    },
    {
        timestamps: true,
        versionKey: false,
    }
);

learningResourceCacheSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

const LearningResourceCache = mongoose.model(
    "LearningResourceCache",
    learningResourceCacheSchema
);

export default LearningResourceCache;