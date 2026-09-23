import mongoose from "mongoose";

const jobCacheItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    company: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    location: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    employmentType: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    experienceLevel: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },

    skills: {
      type: [String],
      default: [],
    },

    salary: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    url: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    source: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
  },
  {
    _id: false,
  }
);

const jobResultCacheSchema = new mongoose.Schema(
  {
    cacheKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    jobs: {
      type: [jobCacheItemSchema],
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

jobResultCacheSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const JobResultCache = mongoose.model(
  "JobResultCache",
  jobResultCacheSchema
);

export default JobResultCache;