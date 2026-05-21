const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    password: {
      type: String,
      required: true
    },
    fullName: {
      type: String,
      default: "Admin"
    },
    role: {
      type: String,
      default: "SUPER_ADMIN"
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    }
  },
  { timestamps: true }
);

const AdminModel = mongoose.model("Admin", AdminSchema);

module.exports = AdminModel;
