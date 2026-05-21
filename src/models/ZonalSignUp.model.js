const mongoose = require("mongoose");
require("dotenv").config();

const ZonalSchema = new mongoose.Schema(
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
      default: "zonal"
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

const ZonalModel = mongoose.model("ZonalUser", ZonalSchema);
module.exports = ZonalModel;
