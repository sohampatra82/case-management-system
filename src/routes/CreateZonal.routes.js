const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const ZonalModel = require("../models/ZonalSignUp.model");
const { Bank, Zone } = require("../models/MasterData.model");
const { body, validationResult } = require("express-validator");

// GET - Show Form with Master Data
router.get("/", async (req, res) => {
  try {
    const banks = await Bank.find({ isActive: true }).sort({ bankName: 1 });
    res.render("CreateZonal", { banks });
  } catch (err) {
    console.error(err);
    res.render("CreateZonal", { banks: [] });
  }
});

// POST - Create Zonal User
router.post(
  "/create-zonal-user",
  [
    body("fullName").trim().isLength({ min: 3 }),
    body("loginId").trim().isLength({ min: 5 }),
    body("email").optional().isEmail().normalizeEmail(),
    body("password").trim().isLength({ min: 6 }),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password)
        throw new Error("Passwords do not match");
      return true;
    })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.send(
          `<h2>Validation Error: ${errors.array()[0]
            .msg}</h2><a href="/create-account-zonal">Try Again</a>`
        );
      }

      const { fullName, loginId, email, password, bank, zone } = req.body;

      const existingUser = await ZonalModel.findOne({
        $or: [{ loginId: loginId.toUpperCase() }, { email }]
      });

      if (existingUser) {
        return res.send(
          `<h2>Login ID or Email already exists!</h2><a href="/create-account-zonal">Try Again</a>`
        );
      }

      const hashPassword = await bcrypt.hash(password, 10);

      await ZonalModel.create({
        fullName,
        loginId: loginId.toUpperCase(),
        email: email || null,
        role: "zonal",
        bank,
        zone,
        password: hashPassword
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
      console.error(error);
      res.send(`<h2>Server Error: ${error.message}</h2>`);
    }
  }
);

module.exports = router;
