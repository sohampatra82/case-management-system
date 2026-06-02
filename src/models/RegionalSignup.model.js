const mongoose = require("mongoose");

const RegionalSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
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
      default: "regional"
    },

    // ✅ Now using ObjectId to match Master Data
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

    password: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    }
  },
  { timestamps: true }
);

const RegionalModel = mongoose.model("RegionalUser", RegionalSchema);
module.exports = RegionalModel;
