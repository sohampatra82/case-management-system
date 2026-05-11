require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

const NewCaseModel = require("../src/models/NewCase.model");

const path = require('path') //REQUIRE PATH
app.set('view engine', 'ejs') //SET VIEW ENGINE TO EJS
app.use(express.json()) //USE JSON
app.use(express.urlencoded({ extended: true })) //USE URL ENCODED
app.use(express.static(path.join(__dirname, 'public'))); //USE STATIC FILES

app.use(express.static("public"));
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





module.exports = app;
