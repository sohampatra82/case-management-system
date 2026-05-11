const mongoose = require('mongoose');
require("dotenv").config();

const NewCaseSchema = new mongoose.Schema(
  {
  accountName: {
        type: String,
        required: true,
        trim: true
    },
    bank: {
        type: String,
        required: true,
        enum: [
            "Punjab National Bank", "SBI", "HDFC", "ICICI", "Axis Bank",
            "Bank of Baroda", "Canara Bank", "Union Bank", "Indian Bank",
            "Central Bank of India", "Bank of India", "IndusInd Bank", "Yes Bank"
        ]
    },
    zone: {
        type: String,
        required: true,
        enum: ["North", "South", "East", "West", "Central"]
    },
    region: {
        type: String,
        trim: true
    },
    branch: {
        type: String,
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
            "Close"
        ],
        default: "ALLOTMENT"
    },

    // ==================== LEGAL TIMELINE (Sec 13(2) & 13(4)) ====================
    allotmentDate: { type: Date },
    noticeDate13_2: { type: Date },
    ackDate: { type: Date },
    noticeDate13_4: { type: Date },
    publicationDate: { type: Date },

    // ==================== COURT & SECTION 14 ====================
    court: { type: String, trim: true },
    filedBy: { type: String, trim: true },
    applicationDate: { type: Date },
    filingDate: { type: Date },
    hearingDate: { type: Date },
    orderDate: { type: Date },
    advocateCommissioner: { type: String, trim: true },

    // ==================== POLICE, POSSESSION & SALE ====================
    policeLetterDate: { type: Date },
    costReceiveDate: { type: Date },
    costDepositDate: { type: Date },
    preIntimationDate: { type: Date },
    possessionDate: { type: Date },
    saleDate: { type: Date },

    // ==================== REMARKS ====================
    initialRemarks: {
        type: String,
        trim: true
    },

    // Optional: You can add more fields later
    remarksHistory: [{
        remark: String,
        date: { type: Date, default: Date.now },
        updatedBy: String
    }],

}, {
    timestamps: true   // Automatically adds createdAt & updatedAt
});

// Index for better performance
NewCaseSchema.index({ accountName: 1 });
NewCaseSchema.index({ bank: 1 });
NewCaseSchema.index({ zone: 1 });
NewCaseSchema.index({ currentStage: 1 });
NewCaseSchema.index({ hearingDate: 1 });
;

const NewCaseModel = mongoose.model('NewCase', NewCaseSchema);

module.exports = NewCaseModel;