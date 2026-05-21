const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt"); // ← Missing import (Main bug)
const ZonalModel = require("../models/ZonalSignUp.model"); // Use consistent name
const { body, validationResult } = require("express-validator");

// GET - Show Create Form
router.get("/", (req, res) => {
  res.render("CreateZonal");
});

// POST - Create Zonal User
router.post(
  "/create-zonal-user",
  // Validation
  body("fullName")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Full name must be at least 3 characters"),
  body("loginId")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Login ID must be at least 5 characters"),
  body("email").optional().isEmail().normalizeEmail(),
  body("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessage = errors.array().map(err => err.msg).join(", ");
        return res.send(`
          <html><head><script src="https://cdn.tailwindcss.com"></script></head>
          <body class="bg-gray-100 flex items-center justify-center min-h-screen">
            <div class="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
              <h2 class="text-2xl font-semibold text-red-600 mb-4">Validation Error</h2>
              <p class="text-gray-700 mb-6">${errorMessage}</p>
              <a href="/create-account-zonal" class="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Try Again</a>
            </div>
          </body></html>
        `);
      }

      const { fullName, loginId, email, password, role, zone } = req.body;

      // Check if user already exists
      const existingUser = await ZonalModel.findOne({
        $or: [{ loginId: loginId.toUpperCase() }, { email }]
      });

      if (existingUser) {
        return res.send(`
          <html><head><script src="https://cdn.tailwindcss.com"></script></head>
          <body class="bg-gray-100 flex items-center justify-center min-h-screen">
            <div class="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
              <h2 class="text-2xl font-semibold text-red-600 mb-4">Sign-up Failed</h2>
              <p class="text-gray-700 mb-6">Login ID or Email already exists.</p>
              <a href="/create-account-zonal" class="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Try Again</a>
            </div>
          </body></html>
        `);
      }

      // Hash password
      const hashPassword = await bcrypt.hash(password, 10);

      // Create user
      await ZonalModel.create({
        fullName,
        loginId: loginId.toUpperCase(),
        email: email || null,
        role: role || "zonal",
        zone: zone || "west",
        password: hashPassword
        // confirmPassword not needed to store
      });

      return res.send(`
        <html><head><script src="https://cdn.tailwindcss.com"></script></head>
        <body class="bg-gray-100 flex items-center justify-center min-h-screen">
          <div class="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
            <h2 class="text-2xl font-semibold text-green-600 mb-4">✅ Success!</h2>
            <p class="text-gray-700 mb-4">Zonal user created successfully.</p>
            <p class="text-gray-600">Redirecting...</p>
            <script>
              setTimeout(() => window.location.href = "/admin-users", 2000);
            </script>
          </div>
        </body></html>
      `);
    } catch (error) {
      console.error("Signup Error:", error);
      return res.send(`
        <html><head><script src="https://cdn.tailwindcss.com"></script></head>
        <body class="bg-gray-100 flex items-center justify-center min-h-screen">
          <div class="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
            <h2 class="text-2xl font-semibold text-red-600 mb-4">Server Error</h2>
            <p class="text-gray-700 mb-6">Something went wrong. Please try again.</p>
            <a href="/create-account-zonal" class="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Try Again</a>
          </div>
        </body></html>
      `);
    }
  }
);

module.exports = router;
