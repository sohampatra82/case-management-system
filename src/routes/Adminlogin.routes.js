require("dotenv").config();
const express = require("express");
const router = express.Router();



router.get("/", (req, res) => {
  res.render("adminLogin");
});

router.post("/", (req, res) => {
  const { username, password } = req.body;

  // Your credentials (Better to move these to .env later)
  const AdminUserName = process.env.Admin_UserName;
  const AdminPassword = process.env.Admin_Password;
  try {
    if (username === AdminUserName && password === AdminPassword) {
      // ✅ Success Page
      res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Login Success</title>
<script src="https://cdn.tailwindcss.com"></script>

<style>
  body {
    background: linear-gradient(135deg, #0f172a, #1e293b, #020617);
  }

  .card {
    backdrop-filter: blur(15px);
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    animation: fadeScale 0.6s ease;
  }

  @keyframes fadeScale {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }

  .loader {
    border: 3px solid rgba(255,255,255,0.2);
    border-top: 3px solid #22c55e;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>

</head>

<body class="flex items-center justify-center min-h-screen text-white">

<div class="card p-10 rounded-2xl shadow-2xl text-center max-w-md w-full">

  <div class="mb-6 flex justify-center">
    <div class="bg-green-500/20 p-5 rounded-full">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-14 h-14 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
      </svg>
    </div>
  </div>

  <h2 class="text-3xl font-semibold mb-2">Welcome Back 👋</h2>
  <p class="text-gray-300 mb-6">Login successful. Redirecting to dashboard...</p>

  <div class="flex justify-center mb-4">
    <div class="loader"></div>
  </div>

  <p class="text-sm text-gray-400">Please wait...</p>

</div>

<script>
  setTimeout(() => {
    window.location.href = "/admin-dashboard";
  }, 2000);
</script>

</body>
</html>
`);
    } else {
      // ❌ Error Page
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Login Failed</title>
<script src="https://cdn.tailwindcss.com"></script>

<style>
  body {
    background: linear-gradient(135deg, #1f2937, #111827, #020617);
  }

  .card {
    backdrop-filter: blur(15px);
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    animation: fadeScale 0.6s ease;
  }

  @keyframes fadeScale {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }

  .btn {
    transition: 0.3s;
  }

  .btn:hover {
    transform: translateY(-2px);
  }
</style>

</head>

<body class="flex items-center justify-center min-h-screen text-white">

<div class="card p-10 rounded-2xl shadow-2xl text-center max-w-md w-full">

  <div class="mb-6 flex justify-center">
    <div class="bg-red-500/20 p-5 rounded-full">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-14 h-14 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </div>
  </div>

  <h2 class="text-3xl font-semibold mb-2">Login Failed</h2>
  <p class="text-gray-300 mb-6">Invalid username or password</p>

  <button onclick="window.history.back()" 
    class="btn bg-red-500 hover:bg-red-600 px-6 py-2 rounded-lg font-medium">
    Try Again
  </button>

</div>

</body>
</html>
`);
    }
  } catch (error) {
    res.status(500).send("<h2>Internal Server Error</h2>");
  }
});


module.exports = router;