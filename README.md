# Case Management System (CMS)

A full-stack Case Management System designed to manage, track, and monitor cases efficiently.  
The system provides role-based access control, case registration, document management, reporting, and dashboard analytics for better workflow management.

---

## 🚀 Features

### 🔐 Authentication & Authorization
- Secure login system
- Role-based access control
- Different dashboards based on user roles:
  - Admin
  - Zonal User
  - Regional User
  - Branch User

---

### 📂 Case Management

- Register new cases
- Update case details
- Track case status
- Assign cases to users
- Add remarks and feedback
- View complete case history

---

### 🏦 Master Data Management

Admin can manage:

- Bank details
- Zone
- Region
- Branch
- User mapping

---

### 📄 Document Management

- Upload case-related documents
- Store and manage important files
- Track document availability

---

### 📊 Dashboard & Reports

- Role-based dashboards
- Case statistics
- Status-wise case reports
- Zone/Region/Branch wise analysis
- Export reports in CSV format

---

### 📧 Email Notification

- Automated email notifications
- Case updates alerts
- User communication support

---

# 🛠️ Tech Stack

## Frontend
- HTML5
- CSS3
- JavaScript
- Bootstrap
- EJS Template Engine

## Backend
- Node.js
- Express.js

## Database
- MongoDB
- Mongoose ODM

## Authentication
- JWT Authentication
- bcrypt Password Hashing

## Other Tools
- Multer (File Upload)
- Nodemailer (Email Service)
- CSV Export
- PM2
- Nginx

---


---

# ⚙️ Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/sohampatra82/case-management-system.git

Go inside project folder

cd case-management-system

Install Dependencies
npm install
🔑 Environment Variables

Create a .env file in the root directory.

Example:

PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
▶️ Run Project

Development Mode
npm run dev

Production Mode
npm start