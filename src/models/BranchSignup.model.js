const mongoose = require("mongoose");
require("dotenv").config();

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
      sparse: true // Allows null/empty
    },
    role: {
      type: String,
      enum: ["zonal", "regional", "branch"],
      default: "branch"
    },
    zone: {
      type: String,
      enum: ["north", "south", "east", "west", "central", "all"],
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
