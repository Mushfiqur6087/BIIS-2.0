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
CREATE USER BIIS IDENTIFIED BY "${BIIS_DB_PASS}"
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
sqlplus -s "BIIS/${BIIS_DB_PASS}@//localhost/FREEPDB1" <<EOF
SET ECHO OFF
SET FEEDBACK OFF
SET DEFINE OFF
WHENEVER SQLERROR CONTINUE
@/opt/biis/sql/BIIS_STRUCTURE.sql
COMMIT;
EXIT;
EOF

echo ">>> [BIIS Init] Schema created."

# ── Step 3: Seed data — run individual table files in dependency order ─────────
# BIIS_DATA.sql is a Navicat DDL dump (DROP+CREATE), NOT a data file.
# The real INSERT data lives in the individual per-table .sql files.
run_seed() {
  local file="$1"
  echo ">>> [BIIS Init]   Seeding: $(basename $file)..."
  sqlplus -s "BIIS/${BIIS_DB_PASS}@//localhost/FREEPDB1" <<EOF
SET ECHO OFF
SET FEEDBACK OFF
SET DEFINE OFF
WHENEVER SQLERROR CONTINUE
@${file}
COMMIT;
EXIT;
EOF
}

echo ">>> [BIIS Init] Seeding tables..."
# Disable all triggers first — audit triggers (LOG_STUDENT, LOG_TEACHER, etc.)
# build a VARCHAR2(255) DETAILS string by concatenating all row fields, which
# overflows on real data and aborts every INSERT. Re-enable after seeding.
sqlplus -s "BIIS/${BIIS_DB_PASS}@//localhost/FREEPDB1" <<EOF
SET ECHO OFF
SET FEEDBACK OFF
BEGIN
  FOR t IN (SELECT trigger_name FROM user_triggers) LOOP
    EXECUTE IMMEDIATE 'ALTER TRIGGER "' || t.trigger_name || '" DISABLE';
  END LOOP;
END;
/
COMMIT;
EXIT;
EOF
echo ">>> [BIIS Init] Triggers disabled for bulk load."

# Order matters: parent tables before child tables
# USER_TABLE must come before STUDENT and TEACHER (FK: STUDENT_ID/TEACHER_ID → USER_TABLE.USER_ID)
run_seed /opt/biis/sql/DEPARTMENT.sql
run_seed /opt/biis/sql/DUES.sql
run_seed /opt/biis/sql/SCHOLARSHIP.sql
run_seed /opt/biis/sql/USER_TABLE.sql
run_seed /opt/biis/sql/STUDENT.sql
run_seed /opt/biis/sql/TEACHER.sql
run_seed /opt/biis/sql/COURSE.sql
run_seed /opt/biis/sql/ADVISOR.sql
run_seed /opt/biis/sql/ENROLLMENT.sql
run_seed /opt/biis/sql/REGISTRATION.sql
run_seed /opt/biis/sql/RESULT.sql
run_seed /opt/biis/sql/TEACHES.sql
run_seed /opt/biis/sql/NOTIFICATION.sql
run_seed /opt/biis/sql/STUDENT_DUES.sql
run_seed /opt/biis/sql/STUDENT_SCHOLARSHIP.sql
run_seed /opt/biis/sql/ADMIN_LOGS.sql

# Re-enable all triggers
sqlplus -s "BIIS/${BIIS_DB_PASS}@//localhost/FREEPDB1" <<EOF
SET ECHO OFF
SET FEEDBACK OFF
BEGIN
  FOR t IN (SELECT trigger_name FROM user_triggers) LOOP
    EXECUTE IMMEDIATE 'ALTER TRIGGER "' || t.trigger_name || '" ENABLE';
  END LOOP;
END;
/
COMMIT;
EXIT;
EOF
echo ">>> [BIIS Init] Triggers re-enabled."

echo ">>> [BIIS Init] ✅ All tables seeded. Initialization complete!"

