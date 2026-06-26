const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const AdminModel = require("../models/Admin.model");
const auth = require("../middleware/auth");


const ensureAdminUser = (req, res, next) => {
    if (!req.session?.user || 
        String(req.session.user.role || "").toLowerCase() !== "admin"
        ) {
        return res.status(403).send("PLEASE LOGIN WITH APPROPRIATE CREDENTIALS");
    }
    next();
};;


// Middleware - Protect Route
const isSuperAdmin = (req, res, next) => {
  if (req.session?.user?.role === "admin") {
    return next();
}
res.status(401).send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unauthorized Access</title>

  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"/>

</head>

<body class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center p-6">

  <div class="w-full max-w-md bg-white shadow-2xl rounded-3xl p-8 text-center border border-gray-100">

    <!-- Icon -->
    <div class="w-24 h-24 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-6">
      <i class="fa-solid fa-lock text-4xl text-red-500"></i>
    </div>

    <!-- Heading -->
    <h1 class="text-3xl font-bold text-gray-800 mb-3">
      Access Denied
    </h1>

    <!-- Message -->
    <p class="text-gray-500 leading-relaxed mb-6">
      You need to login first to access this page.
      Redirecting you to the login page...
    </p>

    <!-- Loader -->
    <div class="flex justify-center mb-6">
      <div class="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>

    <!-- Button -->
    <a href="/"
      class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-medium transition duration-300 shadow-md">
      <i class="fa-solid fa-arrow-right-to-bracket"></i>
      Go to Login
    </a>

    <!-- Timer -->
    <p class="text-xs text-gray-400 mt-6">
      Redirecting automatically in 5 seconds...
    </p>

  </div>

  <script>
    setTimeout(() => {
      window.location.href = "/";
    }, 5000);
  </script>

</body>
</html>
`);};

// GET - Show Profile Page
router.get("/", auth("admin"), ensureAdminUser, isSuperAdmin, async (req, res) => {
  try {
    const admin = await AdminModel.findById(req.session.user.id);
    res.render("AdminChangePassword", { admin: admin });
  } catch (err) {
    res.render("AdminChangePassword", { admin: null });
  }
});

// POST - Update Username & Password
router.post("/update", auth("admin"), ensureAdminUser, isSuperAdmin, async (req, res) => {
  try {
    const { newUsername, currentPassword, newPassword, confirmNewPassword } = req.body;
    const adminId = req.session.user.id;

    const admin = await AdminModel.findById(adminId);
    if (!admin) {
      return res.send(getErrorHTML("Admin account not found"));
    }

    // Verify Current Password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.send(getErrorHTML("Current password is incorrect"));
    }

    const updateData = {};

    // Update Username
    if (newUsername && newUsername.trim() !== "") {
      const newUser = newUsername.trim().toUpperCase();

      const existing = await AdminModel.findOne({ 
        username: newUser, 
        _id: { $ne: adminId } 
      });

      if (existing) {
        return res.send(getErrorHTML("Username already taken"));
      }

      updateData.username = newUser;
    }
    // Update Password
    if (newPassword && confirmNewPassword) {
      if (newPassword !== confirmNewPassword) {
        return res.send(getErrorHTML("New passwords do not match"));
      }
      if (newPassword.length < 5) {
        return res.send(getErrorHTML("Password must be at least 5 characters long"));
      }

      const salt = await bcrypt.genSalt(12);
      updateData.password = await bcrypt.hash(newPassword, salt);
    }

    if (Object.keys(updateData).length === 0) {
      return res.send(getErrorHTML("No changes were made"));
    }

    await AdminModel.findByIdAndUpdate(adminId, updateData);

    // Update session if username changed
    if (updateData.username) {
      req.session.user.username = updateData.username;
    }

    res.send(getSuccessHTML("Profile updated successfully!"));

  } catch (error) {
    console.error(error);
    res.send(getErrorHTML("Something went wrong. Please try again."));
  }
});

// ===================== BEAUTIFUL SUCCESS PAGE =====================
function getSuccessHTML(message) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Success</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-slate-50 min-h-screen flex items-center justify-center">
    <div class="max-w-md w-full mx-4">
        <div class="bg-white rounded-3xl shadow-xl p-10 text-center">
            <div class="w-20 h-20 mx-auto bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <i class="fa-solid fa-check text-4xl text-green-600"></i>
            </div>
            <h1 class="text-3xl font-semibold text-slate-800 mb-3">Success!</h1>
            <p class="text-slate-600 text-lg mb-8">${message}</p>
            
            <a href="/admin-dashboard" 
               class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-4 rounded-2xl transition">
                <i class="fa-solid fa-arrow-right"></i>
                Go to Dashboard
            </a>
        </div>
    </div>
</body>
</html>`;
}

// ===================== BEAUTIFUL ERROR PAGE =====================
function getErrorHTML(message) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-slate-50 min-h-screen flex items-center justify-center">
    <div class="max-w-md w-full mx-4">
        <div class="bg-white rounded-3xl shadow-xl p-10 text-center">
            <div class="w-20 h-20 mx-auto bg-red-100 rounded-2xl flex items-center justify-center mb-6">
                <i class="fa-solid fa-xmark text-4xl text-red-600"></i>
            </div>
            <h1 class="text-3xl font-semibold text-slate-800 mb-3">Update Failed</h1>
            <p class="text-slate-600 text-lg mb-8">${message}</p>
            
            <a href="/admin-change-password" 
               class="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white font-medium px-8 py-4 rounded-2xl transition">
                <i class="fa-solid fa-arrow-left"></i>
                Try Again
            </a>
        </div>
    </div>
</body>
</html>`;
}

module.exports = router;