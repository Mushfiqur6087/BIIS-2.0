# BIIS 2.0 — BUET Institutional Information System

> A centralized academic management platform for administrators, faculty, students, and parents at Bangladesh University of Engineering and Technology (BUET).

---

## 📌 Overview

**BIIS 2.0** is a full-stack web application that digitizes and centralizes the core institutional workflows of a university — from student enrollment and course registration to scholarship management and real-time notifications. Built on a **Node.js/Express** backend with an **Oracle Database**, it provides role-based dashboards for three distinct user types: **Admin**, **Teacher**, and **Student**.

> This is a ground-up rebuild of BIIS 1.0, featuring a more modular architecture, real-time communication via WebSockets, JWT-based authentication, and a significantly richer feature set.

---

## ✨ Features

### 🔐 Authentication & Authorization
- Secure login with **JWT (JSON Web Tokens)** stored in HTTP-only cookies
- Role-based access control — Admin, Teacher, Student
- Token verification middleware on all protected routes
- Graceful session expiry and logout

### 🎓 Student Portal
- View enrolled courses and registration status
- Track academic results and GPA per semester
- Apply for scholarships
- View and pay dues
- Contact academic advisor
- Receive real-time notifications (course approvals, scholarship status)
- Update personal information

### 👨‍🏫 Teacher Portal
- View assigned courses
- Approve/reject student course registrations
- Input and update student grades/GPA
- Approve scholarship applications
- Receive real-time notifications (new applications)
- Update personal profile

### 🛠️ Admin Panel
- Add/remove students and teachers
- View and manage full student & teacher lists
- Assign teachers to courses
- Manage course catalog
- Add, view, and clear student dues
- Manage scholarship programs
- Promote students to next academic year
- Bulk import student data via **CSV upload**
- View real-time system notifications (Socket.IO dashboard)

### 📡 Real-Time Notifications (Socket.IO)
- Live push notifications to Admin, Teacher, and Student dashboards
- Polling every 5 seconds for new notification events
- Role-aware delivery — notifications are routed to the correct user

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Templating** | EJS (Embedded JavaScript) |
| **Database** | Oracle Database (via `oracledb`) |
| **Authentication** | JWT (`jsonwebtoken`) + `bcrypt` |
| **Real-Time** | Socket.IO |
| **File Upload** | Multer (CSV import) |
| **PDF Generation** | pdf-lib |
| **Session Cookies** | cookie-parser |
| **Logging** | Custom middleware (Morgan-style) |
| **Environment** | dotenv |
| **Dev Server** | Nodemon |

---

## 📁 Project Structure

```
BIIS-2.0/
├── Project/
│   ├── server.js                   # Entry point — Express app + Socket.IO
│   ├── package.json
│   ├── config/                     # App configuration
│   ├── middleware/
│   │   ├── verifyJWT.js            # JWT authentication guard
│   │   ├── logEvents.js            # Request logger
│   │   └── errorHandler.js         # Global error handler
│   ├── routes/
│   │   ├── authorization.js        # Login route
│   │   ├── logout.js
│   │   ├── admin.js                # Admin route aggregator
│   │   ├── student.js              # Student route aggregator
│   │   ├── teacher.js              # Teacher route aggregator
│   │   ├── Admin/                  # Granular admin sub-routes
│   │   ├── Student/                # Granular student sub-routes
│   │   └── Teacher/                # Granular teacher sub-routes
│   ├── controllers/
│   │   └── loginController.js
│   ├── Database/
│   │   ├── database.js             # OracleDB connection pool
│   │   ├── notificationUpdate.js   # Notification polling queries
│   │   ├── STUDENT/                # Student-specific query modules
│   │   └── TEACHER/                # Teacher-specific query modules
│   ├── views/                      # EJS templates (36 pages)
│   ├── public/
│   │   ├── css/style.css
│   │   ├── img/
│   │   └── SocketIO-Script*.js     # Client-side Socket.IO handlers
│   ├── logs/                       # Request log files
│   └── ProjectEssentials/
│       ├── Database/               # SQL schema + seed data (18 tables)
│       └── CSV/                    # Sample CSV import files
└── README.md
```

---

## 🗄️ Database Schema Highlights

The Oracle database contains **18 tables**, including:

| Table | Description |
|---|---|
| `STUDENT` | Student personal & academic records |
| `TEACHER` | Faculty profiles |
| `COURSE` | Course catalog |
| `ENROLLMENT` | Student-course registration |
| `RESULT` | Grades and GPA records |
| `SCHOLARSHIP` | Scholarship programs |
| `STUDENT_SCHOLARSHIP` | Scholarship applications |
| `DUES` | Fee definitions |
| `STUDENT_DUES` | Per-student due tracking |
| `ADVISOR` | Student-advisor assignments |
| `TEACHES` | Teacher-course assignments |
| `NOTIFICATION` | System notification log |
| `REGISTRATION` | Semester registration status |
| `USER_TABLE` | Login credentials (hashed) |
| `ADMIN_LOGS` | Admin action audit trail |
| `DEPARTMENT` | Department catalog |

Full SQL schema and seed data available in `Project/ProjectEssentials/Database/`.

---

## ⚙️ Setup & Installation

### Prerequisites
- **Node.js** v18+
- **Oracle Database** (local or remote instance)
- **Oracle Instant Client** (required by `oracledb`)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/BIIS-2.0.git
cd BIIS-2.0/Project
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file inside the `Project/` directory:

```env
DB_USER="your_oracle_username"
DB_PASS="your_oracle_password"
DB_CONNECTION="your_oracle_connection_string"
PORT=3000
JWT_SECRET="your_super_secret_jwt_key"
```

### 4. Set up the database

Run the SQL scripts in the following order using SQL*Plus or Oracle SQL Developer:

```bash
# 1. Create schema (tables, constraints, sequences)
BIIS_STRUCTURE.sql

# 2. Seed all data
BIIS_DATA.sql
```

All SQL files are located in `Project/ProjectEssentials/Database/`.

### 5. Start the server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The app will be available at `http://localhost:<PORT>`.

---

## 🔮 Planned Modernization (Roadmap)

The following improvements are planned for the next phase of development:

### UI/UX Overhaul
- [ ] Replace EJS templates with a modern **React** or **Next.js** frontend
- [ ] Implement a component design system with **Tailwind CSS** or **shadcn/ui**
- [ ] Add dark mode support
- [ ] Responsive mobile-first layouts for all dashboards
- [ ] Animated transitions and micro-interactions

### Backend Improvements
- [ ] Migrate to **PostgreSQL** or **MySQL** for broader accessibility
- [ ] Add **REST API** layer with Swagger/OpenAPI documentation
- [ ] Implement **refresh tokens** and proper token rotation
- [ ] Add **rate limiting** and security hardening (Helmet.js)
- [ ] Structured logging with **Winston** or **Pino**

### New Features
- [ ] Email notifications (nodemailer integration)
- [ ] PDF transcript/result export
- [ ] Admin analytics dashboard (charts, stats)
- [ ] Timetable/schedule management
- [ ] Attendance tracking module
- [ ] Student performance analytics (GPA trend graphs)

### DevOps
- [ ] Docker containerization
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Environment-specific configs (dev/staging/prod)

---

## 🧑‍💻 Author

**Mushfiqur Rahman**
- Originally developed as a 2nd-year database course project at BUET
- Stack: Node.js · Express · Oracle DB · Socket.IO · JWT · EJS

---

## 📄 License

This project is licensed under the **ISC License**. See [LICENSE](./LICENSE) for details.
