# BIIS 2.0 — BUET Institutional Information System

> A modern, containerized academic management platform for administrators, faculty, and students at Bangladesh University of Engineering and Technology (BUET).

---

## 📌 Overview

**BIIS 2.0** is a full-stack web application that digitizes and centralizes the core institutional workflows of a university — from student enrollment and course registration to scholarship management and real-time notifications.

Built on a **SvelteKit** frontend with a **Node.js/Express** REST API backend and an **Oracle Database 23ai**, it provides role-based dashboards for three distinct user types: **Admin**, **Teacher**, and **Student**.

> Ground-up rebuild of BIIS 1.0 — replaces EJS server-side rendering with a modern SvelteKit SPA frontend, adds Docker-compose full-stack deployment (Oracle + Express + SvelteKit + Nginx), JWT authentication, real-time Socket.IO notifications, and a significantly richer feature set.

---

## ✨ Features

### 🔐 Authentication & Authorization
- Secure login with **JWT** stored in HTTP-only cookies
- Role-based access control (Admin, Teacher, Student)
- Token verification middleware on all protected routes
- Graceful session expiry and logout

### 🎓 Student Portal
- View enrolled courses and registration status
- Track academic results and CGPA per semester
- Apply for scholarships (PDF application auto-generated)
- View financial dues and payment status
- View assigned academic advisor contact info
- Receive real-time notifications (course approvals, scholarship status)
- Update personal info and profile photo

### 👨‍🏫 Teacher Portal
- View assigned courses
- Approve/reject student course enrollments
- Assign grades per student per course
- Approve scholarship applications (with PDF download)
- Receive real-time notifications
- Update personal profile and photo

### 🛠️ Admin Panel
- Add / edit / remove students and teachers
- Full searchable student & teacher lists with filters
- Assign teachers to courses (single or **bulk CSV upload**)
- Manage course catalog
- Open/close semester registration; run student promotion with safeguard
- Manage scholarship programs
- Create due categories; assign dues to students via **CSV upload**; mark dues paid via **CSV upload**
- Real-time system notification dashboard (Socket.IO)

### 📡 Real-Time Notifications (Socket.IO)
- Live push to Admin, Teacher, and Student dashboards
- Role-aware delivery (student only gets their own scholarship updates)
- Polling every 5 s for new events

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | SvelteKit + `@sveltejs/adapter-node` |
| **Backend** | Node.js 18 · Express.js |
| **Database** | Oracle Database Free 23ai |
| **ORM/Driver** | `oracledb` (Thin mode — no Instant Client needed) |
| **Authentication** | JWT + `bcrypt` |
| **Real-Time** | Socket.IO |
| **File Upload** | Multer (CSV + photo upload) |
| **PDF Generation** | `pdf-lib` |
| **Reverse Proxy** | Nginx (single entrypoint on port 80) |
| **Containerization** | Docker · Docker Compose v2 |

---

## 🐳 Running with Docker (Recommended)

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/) v2+

**That's it — no Oracle client, no Node.js, no manual DB setup required.**

### 1. Clone the repository
```bash
git clone https://github.com/Mushfiqur6087/BIIS-2.0.git
cd BIIS-2.0
```

### 2. Create the environment file
```bash
cp .env.example .env
```

Edit `.env` — at minimum change `JWT_SECRET`:

```env
ORACLE_SYS_PASSWORD=SysOracle#2024
DB_PASS=BiisPass#2024
JWT_SECRET=change-this-to-a-long-random-secret
NODE_ENV=production
FRONTEND_URL=http://localhost
```

### 3. Start everything
```bash
docker compose up --build
```

On **first run**, Docker will:
1. Pull the Oracle Free 23ai image (~2 GB)
2. Initialize the database (~2–3 minutes)
3. Create the `BIIS` schema user
4. Run all DDL (tables, triggers, procedures)
5. Seed **1,314 users**, **1,102 students**, **163 teachers**, **331 courses**, and more
6. Build and start the SvelteKit frontend + Express backend + Nginx

> ⏳ First boot takes 3–5 minutes. Subsequent starts take ~30 seconds.

### 4. Open the app

```
http://localhost
```

Login with any credential from [`CREDENTIALS.md`](./CREDENTIALS.md). Quick reference:

| Role    | User ID range | Password   |
|---------|--------------|------------|
| Admin   | `2000`       | `12345678` |
| Teacher | `7001–7010`  | `12345678` |
| Student | `8001–8010`  | `12345678` |

---

## 🔧 Docker Commands Reference

```bash
# Start in foreground (shows live logs)
docker compose up --build

# Start in background
docker compose up -d --build

# View live logs
docker compose logs -f

# View only backend logs
docker compose logs -f app

# Stop (data is preserved)
docker compose down

# Full reset — wipes Oracle volume and re-seeds from scratch
docker compose down -v && docker compose up --build

# Rebuild only frontend (no Oracle restart)
docker compose up -d --build frontend nginx

# Access Oracle SQL directly
docker exec -it biis-oracle sqlplus BIIS/BiisPass#2024@//localhost/FREEPDB1
```

---

## 🌐 Architecture

```
Browser → http://localhost (port 80)
              │
         ┌────▼─────────────────────┐
         │      nginx (port 80)     │
         └────┬──────────┬──────────┘
              │          │
       /api/* │   /*     │ (SvelteKit)
    /socket.io│          │
              ▼          ▼
         biis-app   biis-frontend
         :3000          :3000
              │
              ▼
         biis-oracle
         :1521 (FREEPDB1)
```

All services run on a private Docker network. Only nginx is exposed on port 80.

---

## 📁 Project Structure

```
BIIS-2.0/
├── docker-compose.yml          # All 4 services (oracle, app, frontend, nginx)
├── Dockerfile                  # Express backend image
├── docker/
│   ├── nginx.conf              # Reverse proxy config
│   └── oracle-init.sh          # DB init (runs once on first boot)
├── .env.example                # Environment variable template
├── CREDENTIALS.md              # Login credentials reference
│
├── backend/                    # Express REST API
│   ├── server.js               # Entry point — app + Socket.IO
│   ├── package.json
│   ├── config/
│   ├── middleware/
│   │   ├── verifyJWT.js        # JWT auth guard
│   │   ├── logEvents.js        # Request logger
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── authorization.js    # POST /api/auth/login
│   │   ├── logout.js
│   │   ├── admin.js            # /api/admin/*
│   │   ├── student.js          # /api/student/*
│   │   ├── teacher.js          # /api/teacher/*
│   │   ├── Admin/
│   │   ├── Student/
│   │   └── Teacher/
│   ├── Database/
│   │   ├── database.js         # OracleDB connection pool
│   │   ├── STUDENT/
│   │   └── TEACHER/
│   ├── public/img/             # Student/teacher photos
│   ├── docs/scholarship/       # PDF scholarship applications
│   └── ProjectEssentials/
│       ├── Database/           # SQL schema + seed files
│       └── CSV/                # Sample CSV import files
│
├── frontend/                   # SvelteKit SPA
│   ├── Dockerfile              # Multi-stage: build → lean prod image
│   ├── src/
│   │   ├── lib/
│   │   │   ├── api/index.js    # API client (all fetch calls)
│   │   │   ├── stores/auth.js  # Svelte auth store
│   │   │   └── DashboardLayout.svelte
│   │   └── routes/
│   │       ├── +page.svelte    # Login page
│   │       ├── admin/          # Admin portal pages
│   │       ├── student/        # Student portal pages
│   │       └── teacher/        # Teacher portal pages
│   └── vite.config.js
│
└── README.md
```

---

## 🗄️ Database Schema (18 tables)

| Table | Description |
|---|---|
| `USER_TABLE` | Login credentials (bcrypt-hashed passwords) |
| `STUDENT` | Student personal & academic records |
| `TEACHER` | Faculty profiles |
| `DEPARTMENT` | 8 departments (CSE, EEE, BME, ME, CE, IPE, WRE, URP) |
| `COURSE` | 331 courses across all departments |
| `ENROLLMENT` | Student–course registrations & approval status |
| `RESULT` | Grades and GPA records |
| `SCHOLARSHIP` | Scholarship programs |
| `STUDENT_SCHOLARSHIP` | Scholarship applications |
| `DUES` | Fee category definitions |
| `STUDENT_DUES` | Per-student due tracking & payment status |
| `ADVISOR` | Student–advisor assignments |
| `TEACHES` | Teacher–course assignments |
| `NOTIFICATION` | System notification log |
| `REGISTRATION` | Semester registration open/closed status |
| `ADMIN_LOGS` | Admin action audit trail |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login (returns JWT cookie) |
| GET | `/api/auth/me` | Current user info |
| POST | `/api/logout` | Clear JWT cookie |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin` | Dashboard stats |
| GET/DELETE/PATCH | `/api/admin/students/:id` | View / edit / delete student |
| POST | `/api/admin/add-student` | Register new student |
| GET/DELETE/PATCH | `/api/admin/teachers/:id` | View / edit / delete teacher |
| POST | `/api/admin/add-teacher` | Register new teacher |
| POST | `/api/admin/courses` | Add new course |
| POST | `/api/admin/assign-course-teacher` | Assign teacher to course |
| POST | `/api/admin/assign-course-teacher/csv` | Bulk assign via CSV |
| GET/POST | `/api/admin/registration` | Toggle semester registration |
| GET/POST | `/api/admin/promote` | Student promotion |
| POST | `/api/admin/scholarships` | Add scholarship type |
| GET/POST | `/api/admin/dues/new` | List / add due category |
| POST | `/api/admin/dues/add` | Assign dues to students via CSV |
| POST | `/api/admin/dues/clear` | Mark dues paid via CSV |

### Student
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/student` | Dashboard data |
| GET | `/api/student/courses` | Available courses |
| POST | `/api/student/enroll` | Enroll in courses |
| GET | `/api/student/results/detail` | Grades by level/term |
| GET | `/api/student/dues` | Due summary |
| GET | `/api/student/advisor` | Advisor info |
| GET/POST | `/api/student/scholarship` | View / apply for scholarship |
| GET/POST | `/api/student/update-info` | Profile info / update |

### Teacher
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teacher` | Dashboard data |
| GET/POST | `/api/teacher/approve-courses` | List / approve enrollments |
| GET/POST | `/api/teacher/grades` | Grade management |
| GET/POST | `/api/teacher/approve-scholarship` | List / approve scholarships |
| GET/POST | `/api/teacher/update-info` | Profile info / update |

---

## 🧑‍💻 Author

**Mushfiqur Rahman**
- Originally developed as a 2nd-year database course project at BUET
- Stack: SvelteKit · Node.js · Express · Oracle DB · Socket.IO · JWT · Nginx · Docker

---

## 📄 License

This project is licensed under the **ISC License**.
