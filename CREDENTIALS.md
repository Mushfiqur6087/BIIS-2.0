# BIIS 2.0 — Credentials & Setup Reference

## Application Login Credentials

| Role    | User ID | Password   | Notes                        |
|---------|---------|------------|------------------------------|
| Admin   | `2000`  | `12345678` | Full admin panel access      |
| Teacher | `8000`  | `12345678` | Teacher dashboard access     |
| Student | `4269`  | `12345678` | Student portal access        |

> All 1,300+ seeded users share the password `12345678`.

---

## Docker Environment Variables

Defined in `.env` (root of project — **gitignored, never commit this file**):

```env
ORACLE_SYS_PASSWORD=SysOracle#2024   # Oracle SYS/SYSTEM password
DB_PASS=BiisPass#2024                # BIIS schema user password
JWT_SECRET=your-secret-key-here      # JWT signing secret (change in production!)
PORT=3000                            # App port (optional, defaults to 3000)
NODE_ENV=production
```

---

## Application `.env` (Project/.env)

As noted in `to_do.txt`, create `Project/.env` with:

```env
DB_USER=BIIS
DB_PASS=BiisPass#2024
DB_CONNECTION=oracle:1521/FREEPDB1
PORT=3000
JWT_SECRET=your-secret-key-here
```

> **This file is gitignored.** Never commit it. Each developer sets their own.

---

## Database Connection Details

| Property       | Value                  |
|----------------|------------------------|
| Host           | `localhost` (or `oracle` inside Docker) |
| Port           | `1521`                 |
| Service Name   | `FREEPDB1`             |
| Schema User    | `BIIS`                 |
| Schema Password| `BiisPass#2024`        |
| SYS Password   | `SysOracle#2024`       |

Connect via SQL client:
```
BIIS/BiisPass#2024@//localhost:1521/FREEPDB1
```

---

## Quick Start

```bash
# First time (or after wiping data):
docker compose down -v
docker compose up --build

# Subsequent starts (data is preserved):
docker compose up --build

# Stop without wiping data:
docker compose down

# Wipe all data and start fresh:
docker compose down -v && docker compose up --build
```

App is available at **http://localhost:3000**
