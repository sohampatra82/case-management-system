const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const BranchModel = require("../models/BranchSignup.model")
const { body, validationResult } = require("express-validator");



router.get("/", (req, res) => {
  res.render("branchLogin");
});


router.post(
  "/",
  body("loginId").trim().notEmpty().withMessage("Login ID/Email is required"),
  body("password")
    .trim()
    .isLength({ min: 4 })
    .withMessage("Password is required"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.send(`
                    <html><head><script src="https://cdn.tailwindcss.com"></script></head>
                    <body class="bg-gray-100 flex items-center justify-center min-h-screen">
                        <div class="bg-white p-8 rounded-xl shadow max-w-md w-full text-center">
                            <h2 class="text-red-600 text-2xl mb-4">Error</h2>
                            <p>${errors.array()[0].msg}</p>
                            <a href="/zonal-login" class="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-xl">Try Again</a>
                        </div>
                    </body></html>
                `);
      }

      const { loginId, password } = req.body;

      // Find user by loginId or email
      const user = await BranchModel.findOne({
        $or: [
          { loginId: loginId.toUpperCase() },
          { email: loginId.toLowerCase() }
        ]
      });

      if (!user) {
        return res.send(`
                    <html><head><script src="https://cdn.tailwindcss.com"></script></head>
                    <body class="bg-gray-100 flex items-center justify-center min-h-screen">
                        <div class="bg-white p-8 rounded-xl shadow max-w-md w-full text-center">
                            <h2 class="text-red-600 text-2xl mb-4">Login Failed</h2>
                            <p>Invalid Login ID/Email or Password</p>
                            <a href="/zonal-login" class="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-xl">Try Again</a>
                        </div>
                    </body></html>
                `);
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.send(`
                    <html><head><script src="https://cdn.tailwindcss.com"></script></head>
                    <body class="bg-gray-100 flex items-center justify-center min-h-screen">
                        <div class="bg-white p-8 rounded-xl shadow max-w-md w-full text-center">
                            <h2 class="text-red-600 text-2xl mb-4">Login Failed</h2>
                            <p>Invalid Login ID/Email or Password</p>
                            <a href="/zonal-login" class="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-xl">Try Again</a>
                        </div>
                    </body></html>
                `);
      }

      if (user.status === "inactive") {
        return res.send(`<h2>Account is Inactive. Contact Admin.</h2>`);
      }

      // Generate JWT Token
      const token = jwt.sign(
        {
          id: user._id,
          loginId: user.loginId,
          role: user.role,
          zone: user.zone,
          fullName: user.fullName
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Set cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000
      });

      // Success Page
      return res.send(`
                <html><head><script src="https://cdn.tailwindcss.com"></script></head>
                <body class="bg-gray-100 flex items-center justify-center min-h-screen">
                    <div class="bg-white p-8 rounded-xl shadow max-w-md w-full text-center">
                        <h2 class="text-green-600 text-3xl mb-4">✅ Login Successful!</h2>
                        <p>Welcome back, ${user.fullName}</p>
                        <p class="text-gray-600 mt-4">Redirecting to Dashboard...</p>
                        <script>
                            setTimeout(() => {
                                window.location.href = "/branch-dashboard";
                            }, 1500);
                        </script>
                    </div>
                </body></html>
            `);
    } catch (error) {
      console.error(error);
      res.send(`
                <html><head><script src="https://cdn.tailwindcss.com"></script></head>
                <body class="bg-gray-100 flex items-center justify-center min-h-screen">
                    <div class="bg-white p-8 rounded-xl shadow max-w-md w-full text-center">
                        <h2 class="text-red-600 text-2xl mb-4">Server Error</h2>
                        <a href="/branch-login" class="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-xl">Try Again</a>
                    </div>
                </body></html>
            `);
    }
  }
);


module.exports = router;