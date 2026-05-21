const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const AdminModel = require("./models/Admin.model");
require("dotenv").config();

async function createSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Delete any existing super admin
    await AdminModel.deleteMany({ role: "SUPER_ADMIN" });
    console.log("🗑️ Old Super Admins deleted");

    const plainPassword = process.env.Admin_Password ;

    const hashedPassword = await bcrypt.hash(plainPassword, 12);

    const admin = await AdminModel.create({
      username: process.env.Admin_UserName.toUpperCase().trim(),
      password: hashedPassword,
      fullName: "Super Admin",
      role: "SUPER_ADMIN",
      status: "active"
    });

    console.log("\n🎉 SUPER ADMIN CREATED SUCCESSFULLY!");
    console.log("====================================");
    console.log("Username :", admin.username);
    console.log("Password :", plainPassword);
    console.log("Role     :", admin.role);
    console.log("====================================\n");
  } catch (err) {
    console.error("❌ Error creating Super Admin:", err.message);
  } finally {
    mongoose.connection.close();
  }
}

createSuperAdmin();
