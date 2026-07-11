require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const bcrypt = require("bcrypt");
const AdminModel = require("./models/Admin.model");
const session = require("express-session");
const NewCaseModel = require("../src/models/NewCase.model");
const ZonalModel = require("../src/models/ZonalSignUp.model");
const FeedbackModel = require("./models/FeedBack.model");
const path = require('path') //REQUIRE PATH
app.set('view engine', 'ejs') //SET VIEW ENGINE TO EJS
app.use(express.json({limit: '10mb'})) //USE JSON
app.use(express.urlencoded({ extended: true, limit: '10mb' })) //USE URL ENCODED
app.use(express.static(path.join(__dirname, 'public'))); //USE STATIC FILES

app.use(express.static("public"));


app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-super-secret-key-12345",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);


// Routes

const Homerouter = require('./routes/home.routes')
const AdminLoginrouter = require('./routes/Adminlogin.routes')
const RegionalLoginrouter = require('./routes/RegionalLogin.routes')
const ZonalLoginrouter = require("./routes/ZonalLogin.routes");
const BranchLoginrouter = require('./routes/BranchLogin.routes')
const AdminDashboardrouter = require('./routes/Admindashboard.routes')
const caseRouter = require("./routes/Admincase.routes");
const AdminReportsrouterd = require("./routes/AdminReports.routes");
const AdminUsersouterd = require("./routes/AdminUser.routes");
const NewCase = require("./routes/NewCase.routes");
const  CreateAccountRouter = require("./routes/CreateAccount.routes");
const  AdminChangePassword = require("./routes/AdminChangePassword.routes");
const  CreateZonal = require("./routes/CreateZonal.routes");
const  CreateBranch = require("./routes/CreateBranch.routes");
const  CreateRegional = require("./routes/CreateRegional.routes");
const caseViewRouter = require("./routes/CaseView.routes");
const AllLoginRouter = require("./routes/AllLogin.routes");
const MasterDataRouter = require("./routes/MasterData.routes");
const ZonalDashboard = require("./routes/Zonal/Zonal.routes");
const RegionalDashboard = require("./routes/Regional/Regional.routes");
const BranchDashboard = require("./routes/Branch/Branch.routes");
const ZonalCase = require("./routes/Zonal/ZonalCase.routes");
const ZonalReports = require("./routes/Zonal/ZonalReports.routes");
const RegionalCase = require("./routes/Regional/RegionalCase.routes");
const RegionalReports = require("./routes/Regional/RegionalReports.routes");
const BranchCase = require("./routes/Branch/BranchCase.routes");
const BranchReports = require("./routes/Branch/BranchReports.routes");
const ZonalFeedBack = require("./routes/Zonal/ZonalFeedBack.routes");
const RegionalFeedBack = require("./routes/Regional/RegionalFeedBack.routes");
const BranchFeedBack = require("./routes/Branch/BranchFeedBack.routes");
const ZonaCaseFeedBack = require("./routes/Zonal/zonal-case-feedback.routes");
const BranchCaseFeedBack = require("./routes/Branch/branch-case-feedback.routes");
const RegionalCaseFeedBack = require("./routes/Regional/regional-case-feedback.routes");

const currentUserMiddleware = require("./middleware/authMiddleware");
app.use(currentUserMiddleware);

app.use("/", Homerouter);
app.use("/admin-login", AdminLoginrouter);
app.use("/regional-login", RegionalLoginrouter);
app.use("/zonal-login", ZonalLoginrouter);
app.use("/branch-login", BranchLoginrouter);
app.use("/admin-dashboard", AdminDashboardrouter);
// app.use("/admin-case", AdminCaserouterd);
app.use("/admin-reports", AdminReportsrouterd);
app.use("/admin-users", AdminUsersouterd);
app.use("/new-case", NewCase);
app.use('/admin-case', caseRouter);     // ← This is what we are using
app.use("/create-accounts", CreateAccountRouter);     // ← This is what we are using
app.use("/admin-change-password", AdminChangePassword);     // ← This is what we are using
app.use("/create-account-zonal", CreateZonal);     // ← This is what we are using
app.use("/create-account-branch", CreateBranch);     // ← This is what we are using
app.use("/create-account-regional", CreateRegional);     // ← This is what we are using
app.use("/case-view", caseViewRouter);
app.use("/login", AllLoginRouter);
app.use(
  "/admin-change-password",
  require("./routes/AdminChangePassword.routes")
);
app.use("/master-data", MasterDataRouter); 
app.use("/zonal-dashboard", ZonalDashboard);
app.use("/regional-dashboard", RegionalDashboard);
app.use("/branch-dashboard", BranchDashboard);
app.use("/zonal-case", ZonalCase);
app.use("/zonal-reports", ZonalReports);
app.use("/regional-case", RegionalCase);
app.use("/regional-reports", RegionalReports);
app.use("/branch-case", BranchCase);
app.use("/branch-reports", BranchReports);
app.use("/zonal-feedback", ZonalFeedBack);
app.use("/regional-feedback", RegionalFeedBack);
app.use("/branch-feedback", BranchFeedBack);
app.use("/zonal-case-feedback", ZonaCaseFeedBack);
app.use("/regional-case-feedback", RegionalCaseFeedBack);
app.use("/branch-case-feedback", BranchCaseFeedBack);

// Make sure this is at the bottom (before module.exports)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong!" });
});



async function initSuperAdmin() {
  try {
    const existing = await AdminModel.findOne({
      username: "ADMIN"
    });

    if (existing) {
      console.log("✅ Default Admin already exists");
      return;
    }

    const hashed = await bcrypt.hash("Admin@12345", 12);

    await AdminModel.create({
      username: "ADMIN",
      password: hashed,
      fullName: "Super Admin",
      role: "SUPER_ADMIN",
      status: "active"
    });

    console.log("🎉 Default Super Admin Created!");
    console.log("Username: ADMIN");
    console.log("Password: Admin@12345");
  } catch (err) {
    console.error("Error creating super admin:", err.message);
  }
}

// Run only once when server starts
initSuperAdmin();



module.exports = app;
