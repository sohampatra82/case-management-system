const mongoose = require("mongoose");

const BranchSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    loginId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true
    },
    role: {
      type: String,
      enum: ["zonal", "regional", "branch"],
      default: "branch"
    },
    zone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
      required: true
    },
    bank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bank",
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
    password: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    }
  },
  { timestamps: true }
);

const BranchModel = mongoose.model("BranchUser", BranchSchema);
module.exports = BranchModel;
