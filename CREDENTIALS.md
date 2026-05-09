# BIIS 2.0 — Credentials & Setup Reference

## 🔐 Application Login Credentials

> **All seeded users share the same password: `12345678`**

### Admin Accounts — 10 total (IDs: 2000–2009)

| User ID | Password   | Role  |
|---------|------------|-------|
| `2000`  | `12345678` | admin |
| `2001`  | `12345678` | admin |
| `2002`  | `12345678` | admin |
| `2003`  | `12345678` | admin |
| `2004`  | `12345678` | admin |
| `2005`  | `12345678` | admin |
| `2006`  | `12345678` | admin |
| `2007`  | `12345678` | admin |
| `2008`  | `12345678` | admin |
| `2009`  | `12345678` | admin |

### Teacher Accounts — 201 total (IDs: 8000–8200)

| User ID | Password   | Role    |
|---------|------------|---------|
| `8000`  | `12345678` | teacher |
| `8001`  | `12345678` | teacher |
| `8002`  | `12345678` | teacher |
| `8003`  | `12345678` | teacher |
| `8004`  | `12345678` | teacher |
| `8005`  | `12345678` | teacher |
| `8006`  | `12345678` | teacher |
| `8007`  | `12345678` | teacher |
| `8008`  | `12345678` | teacher |
| `8009`  | `12345678` | teacher |
| `8010`  | `12345678` | teacher |
| `...`   | `12345678` | teacher |
| `8200`  | `12345678` | teacher |

### Student Accounts — 1103 total (IDs: 4000–5102)

| User ID | Password   | Role    |
|---------|------------|---------|
| `4000`  | `12345678` | student |
| `4001`  | `12345678` | student |
| `4002`  | `12345678` | student |
| `4003`  | `12345678` | student |
| `4004`  | `12345678` | student |
| `4005`  | `12345678` | student |
| `4006`  | `12345678` | student |
| `4007`  | `12345678` | student |
| `4008`  | `12345678` | student |
| `4009`  | `12345678` | student |
| `4010`  | `12345678` | student |
| `...`   | `12345678` | student |
| `5102`  | `12345678` | student |

---

## 🐳 Docker Environment Variables

Root `.env` file (gitignored — copy from `.env.example`):

```env
ORACLE_SYS_PASSWORD=SysOracle#2024
DB_PASS=BiisPass#2024
JWT_SECRET=your-secret-key-here
PORT=3000
NODE_ENV=production
```

## ⚙️ Application `.env` (Project/.env — also gitignored)

```env
DB_USER=BIIS
DB_PASS=BiisPass#2024
DB_CONNECTION=oracle:1521/FREEPDB1
PORT=3000
JWT_SECRET=your-secret-key-here
```

---

## 🗄️ Database Connection

| Property        | Value                   |
|-----------------|-------------------------|
| Host            | `localhost` (or `oracle` inside Docker) |
| Port            | `1521`                  |
| Service         | `FREEPDB1`              |
| Schema User     | `BIIS`                  |
| Schema Password | `BiisPass#2024`         |
| SYS Password    | `SysOracle#2024`        |

SQL*Plus connect string:
```
BIIS/BiisPass#2024@//localhost:1521/FREEPDB1
```