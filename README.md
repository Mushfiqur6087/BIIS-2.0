# BIIS 2.0 — BUET Institutional Information System

> A centralized academic management platform for administrators, faculty, and students at Bangladesh University of Engineering and Technology (BUET).

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
- Receive real-time notifications
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
- Role-aware delivery

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js 18 |
| **Framework** | Express.js |
| **Templating** | EJS |
| **Database** | Oracle Database Free 23ai (Docker) |
| **ORM/Driver** | `oracledb` (Thin mode — no Instant Client needed) |
| **Authentication** | JWT + `bcrypt` |
| **Real-Time** | Socket.IO |
| **File Upload** | Multer (CSV import) |
| **PDF Generation** | pdf-lib |
| **Containerization** | Docker + Docker Compose |

---

## 🐳 Running with Docker (Recommended)

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/) v2+

That's it — **no Oracle client, no Node.js, no manual DB setup required.**

### 1. Clone the repository
```bash
git clone https://github.com/Mushfiqur6087/BIIS-2.0.git
cd BIIS-2.0
```

### 2. Create the environment file
```bash
cp .env.example .env
```

Edit `.env` and set your `JWT_SECRET` (everything else has working defaults):

```env
ORACLE_SYS_PASSWORD=SysOracle#2024
DB_PASS=BiisPass#2024
JWT_SECRET=change-this-to-a-long-random-secret
PORT=3000
NODE_ENV=production
```

### 3. Start everything
```bash
docker compose up --build
```

On **first run**, Docker will:
1. Pull the Oracle Free 23ai image
2. Decompress and initialize the database (~2–3 minutes)
3. Create the `BIIS` schema user
4. Run all DDL (tables, triggers, procedures)
5. Seed **1,314 users**, **1,102 students**, **163 teachers**, **331 courses**, and more
6. Start the Node.js app

> ⏳ First boot takes 3–5 minutes. Subsequent starts take ~30 seconds.

### 4. Open the app
```
http://localhost:3000
```

Login with any credential from [`CREDENTIALS.md`](./CREDENTIALS.md). Quick reference:

| Role    | User ID | Password   |
|---------|---------|------------|
| Admin   | `2000`  | `12345678` |
| Teacher | `8000`  | `12345678` |
| Student | `4000`  | `12345678` |

---

## 🔧 Docker Commands Reference

```bash
# Start (data is preserved between restarts)
docker compose up --build

# Stop without losing data
docker compose down

# Stop AND wipe all database data (full fresh init on next start)
docker compose down -v

# View live logs
docker compose logs -f

# View only app logs
docker compose logs -f app

# Access Oracle SQL directly
docker exec -it biis-oracle sqlplus BIIS/BiisPass#2024@//localhost/FREEPDB1
```

---

## 📁 Project Structure

```
BIIS-2.0/
├── docker-compose.yml              # Service definitions (Oracle + App)
├── Dockerfile                      # Node.js app container
├── docker/
│   └── oracle-init.sh              # DB init script (runs once on first boot)
├── .env.example                    # Environment variable template
├── CREDENTIALS.md                  # Login credentials reference
├── Project/
│   ├── server.js                   # Entry point — Express app + Socket.IO
│   ├── package.json
│   ├── config/
│   ├── middleware/
│   │   ├── verifyJWT.js            # JWT authentication guard
│   │   ├── logEvents.js            # Request logger
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── authorization.js        # Login route
│   │   ├── logout.js
│   │   ├── admin.js
│   │   ├── student.js
│   │   ├── teacher.js
│   │   ├── Admin/
│   │   ├── Student/
│   │   └── Teacher/
│   ├── Database/
│   │   ├── database.js             # OracleDB connection pool
│   │   ├── STUDENT/                # Student query modules
│   │   └── TEACHER/                # Teacher query modules
│   ├── views/                      # EJS templates
│   ├── public/
│   │   ├── css/style.css
│   │   └── img/
│   └── ProjectEssentials/
│       ├── Database/               # SQL schema + per-table seed files
│       └── CSV/                    # Sample CSV import files
└── README.md
```

---

## 🗄️ Database Schema

The Oracle schema contains **18 tables**:

| Table | Description |
|---|---|
| `USER_TABLE` | Login credentials (bcrypt hashed) |
| `STUDENT` | Student personal & academic records |
| `TEACHER` | Faculty profiles |
| `DEPARTMENT` | 8 departments (CSE, EEE, BME, ME, CE, IPE, WRE, URP) |
| `COURSE` | 331 courses across all departments |
| `ENROLLMENT` | Student–course registrations |
| `RESULT` | Grades and GPA records |
| `SCHOLARSHIP` | Scholarship programs |
| `STUDENT_SCHOLARSHIP` | Scholarship applications |
| `DUES` | Fee definitions |
| `STUDENT_DUES` | Per-student due tracking |
| `ADVISOR` | Student–advisor assignments |
| `TEACHES` | Teacher–course assignments |
| `NOTIFICATION` | System notification log |
| `REGISTRATION` | Semester registration status |
| `ADMIN_LOGS` | Admin action audit trail |

---

## 🧑‍💻 Author

**Mushfiqur Rahman**
- Originally developed as a 2nd-year database course project at BUET
- Stack: Node.js · Express · Oracle DB · Socket.IO · JWT · EJS · Docker

---

## 📄 License

This project is licensed under the **ISC License**.
