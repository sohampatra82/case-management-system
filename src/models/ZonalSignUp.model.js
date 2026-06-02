const mongoose = require("mongoose");

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
      sparse: true
    },
    role: {
      type: String,
      enum: ["zonal", "regional", "branch"],
      default: "zonal"
    },

    // ✅ Changed to ObjectId for proper linking with Master Data
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
