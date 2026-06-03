const mongoose = require("mongoose");

// Bank Schema

const bankSchema = new mongoose.Schema(
  {
    bankName: { 
      type: String, 
      required: true, 
      trim: true 
      // unique: true  ← Remove this line
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Zone Schema
const zoneSchema = new mongoose.Schema(
  {
    zoneName: { type: String, required: true, trim: true },
    bank: { type: mongoose.Schema.Types.ObjectId, ref: "Bank", required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Region Schema
const regionSchema = new mongoose.Schema(
  {
    regionName: { type: String, required: true, trim: true },
   bank: { type: mongoose.Schema.Types.ObjectId, ref: "Bank", required: true },
    zone: { type: mongoose.Schema.Types.ObjectId, ref: "Zone", required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Branch Schema
const branchSchema = new mongoose.Schema(
  {
    branchName: { type: String, required: true, trim: true },
    branchCode: { type: String, sparse: true },
    bank: { type: mongoose.Schema.Types.ObjectId, ref: "Bank", required: true },
    zone: { type: mongoose.Schema.Types.ObjectId, ref: "Zone", required: true },
    region: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Region",
      required: true
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const Bank = mongoose.model("Bank", bankSchema);
const Zone = mongoose.model("Zone", zoneSchema);
const Region = mongoose.model("Region", regionSchema);
const Branch = mongoose.model("Branch", branchSchema);

module.exports = { Bank, Zone, Region, Branch };
