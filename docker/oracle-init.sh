#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# oracle-init.sh
#
# Executed ONCE by gvenzl/oracle-free on first container startup, inside the
# container as the `oracle` OS user, AFTER the database has been created.
#
# What this does:
#   1. Creates the BIIS schema user with the password from APP_USER_PASSWORD
#   2. Grants it all necessary privileges
#   3. Runs BIIS_STRUCTURE.sql  (DDL — tables, functions, procedures, triggers)
#   4. Runs BIIS_DATA.sql       (DML — seed data for all 18 tables)
#
# CSVs are NOT loaded here — they are runtime upload files used by the admin
# panel's bulk-import feature and are already reflected in BIIS_DATA.sql.
# ─────────────────────────────────────────────────────────────────────────────

set -e

echo ">>> [BIIS Init] Starting schema initialization..."

# ── Step 1: Create BIIS user and grant privileges ────────────────────────────
echo ">>> [BIIS Init] Creating BIIS user..."
sqlplus -s "sys/${ORACLE_PASSWORD}@//localhost/FREEPDB1 as sysdba" <<EOF
-- Suppress output noise
SET ECHO OFF
SET FEEDBACK OFF
SET VERIFY OFF

-- Drop user if already exists (idempotent re-runs)
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM dba_users WHERE username = 'BIIS';
  IF v_count > 0 THEN
    EXECUTE IMMEDIATE 'DROP USER BIIS CASCADE';
    DBMS_OUTPUT.PUT_LINE('Dropped existing BIIS user.');
  END IF;
END;
/

-- Create the BIIS schema user
CREATE USER BIIS IDENTIFIED BY "${APP_USER_PASSWORD}"
  DEFAULT TABLESPACE USERS
  TEMPORARY TABLESPACE TEMP
  QUOTA UNLIMITED ON USERS;

-- Grant all required privileges
GRANT CONNECT, RESOURCE, CREATE SESSION TO BIIS;
GRANT CREATE TABLE, CREATE VIEW, CREATE SEQUENCE TO BIIS;
GRANT CREATE PROCEDURE, CREATE FUNCTION, CREATE TRIGGER TO BIIS;
GRANT CREATE TYPE TO BIIS;
GRANT UNLIMITED TABLESPACE TO BIIS;
GRANT SELECT ANY DICTIONARY TO BIIS;

COMMIT;
EXIT;
EOF

echo ">>> [BIIS Init] BIIS user created successfully."

# ── Step 2: Run schema (DDL) ─────────────────────────────────────────────────
echo ">>> [BIIS Init] Running BIIS_STRUCTURE.sql (DDL)..."
sqlplus -s "BIIS/${APP_USER_PASSWORD}@//localhost/FREEPDB1" <<EOF
SET ECHO OFF
SET FEEDBACK OFF
SET DEFINE OFF
WHENEVER SQLERROR CONTINUE
@/docker-entrypoint-initdb.d/sql/BIIS_STRUCTURE.sql
COMMIT;
EXIT;
EOF

echo ">>> [BIIS Init] Schema created."

# ── Step 3: Run seed data (DML) ──────────────────────────────────────────────
echo ">>> [BIIS Init] Running BIIS_DATA.sql (seed data — this may take a minute)..."
sqlplus -s "BIIS/${APP_USER_PASSWORD}@//localhost/FREEPDB1" <<EOF
SET ECHO OFF
SET FEEDBACK OFF
SET DEFINE OFF
WHENEVER SQLERROR CONTINUE
@/docker-entrypoint-initdb.d/sql/BIIS_DATA.sql
COMMIT;
EXIT;
EOF

echo ">>> [BIIS Init] Seed data loaded."
echo ">>> [BIIS Init] ✅ Database initialization complete!"
