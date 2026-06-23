const mongoose = require("mongoose");

const NewCaseSchema = new mongoose.Schema(
  {
    caseNumber: {
      type: String,
      unique: true,
      trim: true
    },

    // Master Data References
    bank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bank",
      required: true
    },

    zone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
      required: true
    },

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

    // Basic Details
    borrowerName: {
      type: String,
      required: true,
      trim: true
    },

    currentStage: {
      type: String,
      enum: [
        "ALLOTMENT",
        "Section 13(2)",
        "Section 13(4)",
        "Section 14",
        "Possession",
        "Sale",
        "Sale Completed",
        "Completed",
        "Close"
      ],
      default: "ALLOTMENT"
    },

    // Remarks
    initialRemarks: {
      type: String,
      default: ""
    },

    remarksHistory: [
      {
        remark: String,
        date: {
          type: Date,
          default: Date.now
        },
        updatedBy: String
      }
    ],

    // ======================
    // SARFAESI Timeline
    // ======================

    allotmentDate: Date,

    noticeDate13_2: Date,

    ackDate: Date,

    noticeDate13_4: Date,

    publicationDate: Date,

    // ======================
    // Section 14 / Court
    // ======================

    court: {
      type: String,
      trim: true
    },

    filedBy: {
      type: String,
      trim: true
    },

    applicationDate: Date,

    filingDate: Date,

    hearingDate: Date,

    orderDate: Date,

    advocateCommissioner: {
      type: String,
      trim: true
    },

    // ======================
    // Possession Details
    // ======================

    policeLetterDate: Date,

    costReceiveDate: Date,

    costDepositDate: Date,

    preIntimationDate: Date,

    possessionDate: Date,

    // ======================
    // Sale
    // ======================

    saleDate: Date
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("NewCase", NewCaseSchema);
