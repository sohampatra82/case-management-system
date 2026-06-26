const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
  

  {
    category: {
      type: String,
      required: true,
      enum: ["System Issue", "Feature Suggestion", "Report Error", "Other"]
    },

    subject: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Closed"],
      default: "Pending"
    },

    submittedBy: {
      type: String,
      required: true
    },

    zone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone"
    },

    adminRemarks: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const FeedbackModel = mongoose.model("Feedback", FeedbackSchema);

module.exports = FeedbackModel;
