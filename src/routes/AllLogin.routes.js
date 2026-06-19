const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const ZonalModel = require("../models/ZonalSignUp.model");
const RegionalModel = require("../models/RegionalSignup.model");
const BranchModel = require("../models/BranchSignup.model");
const AdminModel = require("../models/Admin.model");

router.get("/", (req, res) => {
  res.render("login");
});

router.post("/", async (req, res) => {
  const { role, loginId, password } = req.body;

  if (!role || !loginId || !password) {
    return res.send(
      `<h2 class="text-red-500 text-center mt-20">All fields are required!</h2>`
    );
  }

  try {
    let user = null;
    let redirectPath = "";
    let fullName = "User";

    // ===================== SUPER ADMIN =====================

if (role === "super-admin") {
      const loginIdUpper = loginId.toUpperCase().trim();

      user = await AdminModel.findOne({ username: loginIdUpper });

      if (!user) {
        return res.send(getErrorHTML("Invalid Login ID for selected role"));
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.send(getErrorHTML("Incorrect Password"));
      }

      fullName = user.fullName || "Super Admin";
      redirectPath = "/admin-dashboard";

      // ✅ FIXED: Match Admin Dashboard middleware expectation
      req.session.user = {
        id: user._id,
        adminId: user._id,           // ← Important for middleware
        username: user.username,
        fullName: fullName,
        role: "admin",               // ← Changed to "admin" to match dashboard
        zone: "All Zones"
      };

      console.log("✅ Super Admin Logged In:", req.session.user);
      return res.send(getSuccessHTML(fullName, redirectPath));
    }
   else if (role === "zonal") {

    user = await ZonalModel.findOne({
        loginId: loginId.toUpperCase()
    });

    if (!user) {
        return res.send(
            getErrorHTML("Invalid Login ID for selected role")
        );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.send(
            getErrorHTML("Incorrect Password")
        );
    }

    redirectPath = "/zonal-dashboard";
    fullName = user.fullName || user.name || "User";

    req.session.user = {
        id: user._id,
        fullName,
        loginId: user.loginId,
        role: user.role,
        bank: user.bank,
        zone: user.zone
    };

    return res.send(getSuccessHTML(fullName, redirectPath));
}

else if (role === "regional") {

    user = await RegionalModel.findOne({
        loginId: loginId.toUpperCase().trim()
    });

    if (!user) {
        return res.send(getErrorHTML("Invalid Login ID for selected role"));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.send(getErrorHTML("Incorrect Password"));
    }

    redirectPath = "/regional-dashboard";
    fullName = user.fullName || "Regional User";

    req.session.user = {
        id: user._id,
        fullName,
        loginId: user.loginId,
        role: "regional",
        bank: user.bank,
        zone: user.zone,
        region: user.region,
        branch: user.branch || null
    };

    console.log("REGIONAL SESSION:", req.session.user);

    return res.send(getSuccessHTML(fullName, redirectPath));
}
else if (role === "branch") {

    user = await BranchModel.findOne({
        loginId: loginId.toUpperCase().trim()
    });

    if (!user) {
        return res.send(getErrorHTML("Invalid Login ID for selected role"));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.send(getErrorHTML("Incorrect Password"));
    }

    redirectPath = "/branch-dashboard";
    fullName = user.fullName || "Branch User";

    req.session.user = {
        id: user._id,
        fullName,
        loginId: user.loginId,
        role: "branch",
        bank: user.bank,
        zone: user.zone,
        region: user.region,
        branch: user.branch
    };

    console.log("BRANCH SESSION:", req.session.user);

    return res.send(getSuccessHTML(fullName, redirectPath));
}
    else {
      return res.send(getErrorHTML("Invalid Role Selected"));
    }

    if (!user) {
      return res.send(getErrorHTML("Invalid Login ID for selected role"));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.send(getErrorHTML("Incorrect Password"));
    }

    fullName = user.fullName || user.name || "User";

    res.send(getSuccessHTML(fullName, redirectPath));
  } catch (err) {
    console.error(err);
    res.send(
      `<h2 class="text-red-500 text-center mt-20">Server Error Occurred</h2>`
    );
  }
});

// ==================== BEAUTIFUL SUCCESS HTML ====================
function getSuccessHTML(name, redirectPath) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Success</title>

    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

    <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css">

    <style>
        *{
            margin:0;
            padding:0;
            box-sizing:border-box;
        }

        body{
            font-family:'Inter',sans-serif;
            background:#f8fafc;
            height:100vh;
            display:flex;
            align-items:center;
            justify-content:center;
            padding:20px;
        }

        .card{
            width:100%;
            max-width:420px;
            background:white;
            border-radius:24px;
            padding:40px 32px;
            text-align:center;
            box-shadow:0 10px 40px rgba(15,23,42,0.08);
            border:1px solid #e2e8f0;
        }

        .icon{
            width:90px;
            height:90px;
            margin:0 auto 24px;
            border-radius:50%;
            background:#dcfce7;
            display:flex;
            align-items:center;
            justify-content:center;
        }

        .icon i{
            font-size:42px;
            color:#16a34a;
        }

        h1{
            font-size:28px;
            color:#0f172a;
            margin-bottom:10px;
        }

        p{
            color:#64748b;
            font-size:15px;
            line-height:1.6;
        }

        .name{
            color:#0f172a;
            font-weight:600;
        }

        .loader{
            width:42px;
            height:42px;
            border:4px solid #dbeafe;
            border-top:4px solid #2563eb;
            border-radius:50%;
            margin:28px auto 18px;
            animation:spin 1s linear infinite;
        }

        @keyframes spin{
            100%{
                transform:rotate(360deg);
            }
        }

        .redirect{
            font-size:14px;
            color:#94a3b8;
        }
    </style>
</head>
<body>

    <div class="card">

        <div class="icon">
            <i class="fa-solid fa-check"></i>
        </div>

        <h1>Login Successful</h1>

        <p>
            Welcome back,
            <span class="name">${name}</span>
        </p>

        <div class="loader"></div>

        <p class="redirect">
            Redirecting to dashboard...
        </p>

    </div>

    <script>
        setTimeout(() => {
            window.location.href = "${redirectPath}";
        }, 2200);
    </script>

</body>
</html>`;
}

// ==================== BEAUTIFUL ERROR HTML ====================
function getErrorHTML(message) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Failed</title>

    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

    <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css">

    <style>
        *{
            margin:0;
            padding:0;
            box-sizing:border-box;
        }

        body{
            font-family:'Inter',sans-serif;
            background:#f8fafc;
            height:100vh;
            display:flex;
            align-items:center;
            justify-content:center;
            padding:20px;
        }

        .card{
            width:100%;
            max-width:420px;
            background:white;
            border-radius:24px;
            padding:40px 32px;
            text-align:center;
            box-shadow:0 10px 40px rgba(15,23,42,0.08);
            border:1px solid #e2e8f0;
        }

        .icon{
            width:90px;
            height:90px;
            margin:0 auto 24px;
            border-radius:50%;
            background:#fee2e2;
            display:flex;
            align-items:center;
            justify-content:center;
        }

        .icon i{
            font-size:42px;
            color:#dc2626;
        }

        h1{
            font-size:28px;
            color:#0f172a;
            margin-bottom:10px;
        }

        p{
            color:#64748b;
            font-size:15px;
            line-height:1.6;
            margin-bottom:28px;
        }

        .btn{
            display:flex;
            align-items:center;
            justify-content:center;
            gap:10px;
            width:100%;
            height:52px;
            border-radius:14px;
            background:#2563eb;
            color:white;
            text-decoration:none;
            font-weight:600;
            transition:0.2s;
        }

        .btn:hover{
            background:#1d4ed8;
        }
    </style>
</head>
<body>

    <div class="card">

        <div class="icon">
            <i class="fa-solid fa-xmark"></i>
        </div>

        <h1>Login Failed</h1>

        <p>${message}</p>

        <a href="/" class="btn">
            <i class="fa-solid fa-arrow-left"></i>
            Back to Login
        </a>

    </div>

</body>
</html>`;
}

module.exports = router;
