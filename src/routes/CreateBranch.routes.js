const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const BranchModel = require("../models/BranchSignup.model");
const { Bank, Zone, Region, Branch } = require("../models/MasterData.model");
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");


const ensureAdminUser = (req, res, next) => {
    if (!req.session?.user || 
        String(req.session.user.role || "").toLowerCase() !== "admin"
        ) {
        return res.status(403).send("PLEASE LOGIN WITH APPROPRIATE CREDENTIALS");
    }
    next();
};;



// GET - Show Form with Master Data
router.get("/", auth("admin"), ensureAdminUser, async (req, res) => {
  try {
    const banks = await Bank.find({ isActive: true }).sort({ bankName: 1 });
    res.render("CreateBranch", { banks });
  } catch (err) {
    console.error(err);
    res.render("CreateBranch", { banks: [] });
  }
});

// POST - Create Branch User
router.post(
  "/create-branch-user",
  [
    body("fullName").trim().isLength({ min: 3 }),
    body("loginId").trim().isLength({ min: 5 }),
    body("email").optional().isEmail().normalizeEmail(),
    body("password").trim().isLength({ min: 6 }),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password)
        throw new Error("Passwords do not match");
      return true;
    }),
    body("bank").notEmpty(),
    body("zone").notEmpty(),
    body("region").notEmpty(),
    body("branch").notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
   if (!errors.isEmpty()) {
     const errorMessage = errors.array()[0].msg;

     return res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Validation Error</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 flex items-center justify-center min-h-screen">

      <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">

        <div class="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
          <span class="text-4xl">⚠️</span>
        </div>

        <h2 class="text-2xl font-bold text-red-600 mb-3">
          Validation Failed
        </h2>

        <p class="text-gray-700 mb-6">
          ${errorMessage}
        </p>

        <a href="/create-account-branch"
           class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition">
           Go Back
        </a>

      </div>

    </body>
    </html>
  `);
   }

      const {
        fullName,
        loginId,
        email,
        password,
        bank,
        zone,
        region,
        branch
      } = req.body;

      const existingUser = await BranchModel.findOne({
        $or: [{ loginId: loginId.toUpperCase() }, { email }]
      });

 if (existingUser) {
   return res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>User Already Exists</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 flex items-center justify-center min-h-screen">

      <div class="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full text-center">

        <div class="text-6xl mb-4">⚠️</div>

        <h2 class="text-2xl font-bold text-red-600 mb-3">
          Login ID or Email Already Exists
        </h2>

        <p class="text-gray-600 mb-2">
          Please use a different Login ID or Email.
        </p>

        <p class="text-sm text-gray-500">
          Redirecting in 3 seconds...
        </p>

        <script>
          setTimeout(() => {
            window.location.href = "/create-account-branch";
          }, 3000);
        </script>

      </div>

    </body>
    </html>
  `);
 }

      const hashPassword = await bcrypt.hash(password, 10);

      await BranchModel.create({
        fullName,
        loginId: loginId.toUpperCase(),
        email: email || null,
        role: "branch",
        bank,
        zone,
        region,
        branch,
        password: hashPassword
      });

      res.send(`
        <html><head><script src="https://cdn.tailwindcss.com"></script></head>
        <body class="bg-gray-100 flex items-center justify-center min-h-screen">
          <div class="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
            <h2 class="text-2xl font-semibold text-green-600 mb-4">✅ Success!</h2>
            <p class="text-gray-700 mb-4">Branch user created successfully.</p>
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
