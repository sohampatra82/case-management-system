const mongoose = require("mongoose");

const CaseFeedbackSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },

    comments: {
      type: String,
      required: true,
      trim: true
    },

    suggestions: {
      type: String,
      trim: true
    },

    submittedBy: {
      type: String,
      required: true
    },

    userEmail: {
      type: String
    },

    role: {
      type: String,
      enum: ["zonal", "regional", "branch", "admin"],
      required: true
    },

    zone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ZonalSignUp"
    },

    feedbackType: {
      type: String,
      default: "general_feedback"
    },

    status: {
      type: String,
      enum: ["pending", "reviewed", "action_taken"],
      default: "pending"
    }
  },
  { timestamps: true }
);

CaseFeedbackSchema.index({ createdAt: -1 });

const CaseFeedbackModel = mongoose.model("CaseFeedback", CaseFeedbackSchema);

module.exports = CaseFeedbackModel;
