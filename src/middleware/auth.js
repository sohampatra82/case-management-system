
module.exports = (...roles) => {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.redirect("/"); // Redirect to login if not logged in
    }

    const userRole = String(req.session.user.role || "").toLowerCase();

    if (!roles.includes(userRole)) {
      // ✅ Return Beautiful 403 Error Page instead of plain text
      return res.status(403).send(getAccessDeniedHTML());
    }

    next();
  };
};

// ====================== BEAUTIFUL 403 ERROR PAGE ======================
function getAccessDeniedHTML() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Access Denied - SARFAESI CMS</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css">

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #f8fafc, #e0f2fe);
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .error-card {
            width: 100%;
            max-width: 460px;
            background: white;
            border-radius: 24px;
            padding: 50px 40px;
            text-align: center;
            box-shadow: 0 20px 50px rgba(15, 23, 42, 0.1);
            border: 1px solid #e2e8f0;
        }

        .icon-container {
            width: 100px;
            height: 100px;
            margin: 0 auto 24px;
            background: #fee2e2;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .icon-container i {
            font-size: 48px;
            color: #ef4444;
        }

        h1 {
            font-size: 28px;
            color: #0f172a;
            margin-bottom: 12px;
        }

        p {
            color: #64748b;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 32px;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: #1e40af;
            color: white;
            padding: 14px 28px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 600;
            font-size: 15px;
            transition: all 0.3s;
        }

        .btn:hover {
            background: #1e3a8a;
            transform: translateY(-2px);
        }

        .footer-text {
            margin-top: 30px;
            font-size: 13px;
            color: #94a3b8;
        }
    </style>
</head>
<body>

    <div class="error-card">
        <div class="icon-container">
            <i class="fa-solid fa-lock"></i>
        </div>

        <h1>Access Denied</h1>
        <p>You don't have permission to access this page.<br>
           Please login with appropriate credentials.</p>

        <a href="/" class="btn">
            <i class="fa-solid fa-arrow-left"></i>
            Back to Login
        </a>

        <div class="footer-text">
            SARFAESI CMS • Secure Access Control
        </div>
    </div>

</body>
</html>`;
}
