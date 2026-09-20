import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    technologies: {
      type: [String],
      default: [],
    },

    projectUrl: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    _id: false,
  }
);

const experienceSchema = new mongoose.Schema(
  {
    organization: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    role: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    _id: false,
  }
);

const certificationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    issuer: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    issueDate: {
      type: Date,
    },

    credentialUrl: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    _id: false,
  }
);

const educationSchema = new mongoose.Schema(
  {
    degree: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    branch: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    university: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    graduationYear: {
      type: Number,
      min: 1900,
      max: 2200,
    },
    academicYear: {
      type: Number,
      min: 1,
      max: 6,
    },

    cgpa: {
      type: Number,
      min: 0,
      max: 10,
    },
  },
  {
    _id: false,
  }
);

const profileSchema = new mongoose.Schema(
  {
    education: {
      type: educationSchema,
      default: () => ({}),
    },

    technicalSkills: {
      type: [String],
      default: [],
    },

    softSkills: {
      type: [String],
      default: [],
    },

    interests: {
      type: [String],
      default: [],
    },

    projects: {
      type: [projectSchema],
      default: [],
    },

    experience: {
      type: [experienceSchema],
      default: [],
    },

    certifications: {
      type: [certificationSchema],
      default: [],
    },

    hasInternship: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      select: false,
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // Signup OTP
    otpHash: {
      type: String,
      select: false,
    },

    otpExpiresAt: {
      type: Date,
      select: false,
    },

    otpLastSentAt: {
      type: Date,
      select: false,
    },

    // Password reset OTP
    resetOtpHash: {
      type: String,
      select: false,
    },

    resetOtpExpiresAt: {
      type: Date,
      select: false,
    },

    resetOtpLastSentAt: {
      type: Date,
      select: false,
    },

    // Password reset authorization token
    resetTokenHash: {
      type: String,
      select: false,
    },

    resetTokenExpiresAt: {
      type: Date,
      select: false,
    },

    // Employability profile
    profile: {
      type: profileSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const User = mongoose.model("User", userSchema);

export default User;