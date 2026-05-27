const mongoose = require("mongoose");

const NewCaseSchema = new mongoose.Schema(
  {
    caseNumber: { type: String, unique: true, trim: true },

    // References to Master Data
    bank: { type: mongoose.Schema.Types.ObjectId, ref: "Bank", required: true },
    zone: { type: mongoose.Schema.Types.ObjectId, ref: "Zone", required: true },
    region: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Region",
      required: true
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true
    },

    borrowerName: { type: String, required: true, trim: true },
    // loanAccountNumber: { type: String, required: true, trim: true },
    outstandingAmount: { type: Number, required: true },
    propertyAddress: { type: String, trim: true },

    currentStage: {
      type: String,
      enum: [
        "ALLOTMENT",
        "Section 13(2)",
        "Section 13(4)",
        "Section 14",
        "Possession",
        "Sale",
        "Sale Completed", // ← Add
        "Completed", // ← Add
        "Close"
      ],
      default: "ALLOTMENT"
    },

    // Existing timeline fields...
    allotmentDate: Date,
    noticeDate13_2: Date,
    // ... (keep all your existing date fields)

    initialRemarks: String,
    remarksHistory: [
      {
        remark: String,
        date: { type: Date, default: Date.now },
        updatedBy: String
      }
    ]
  },
  { timestamps: true }
);

const NewCaseModel = mongoose.model("NewCase", NewCaseSchema);
module.exports = NewCaseModel;
