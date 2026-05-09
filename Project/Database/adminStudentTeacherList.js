const database = require("./database");
const file = require("../config/findImage");

// Inline replacement for GET_FULL_DEPARTMENT_NAME (Oracle function in invalid state)
const FULL_DEPT_NAME_CASE = `
  CASE DEPARTMENT_NAME
    WHEN 'BME' THEN 'Department of Biomedical Engineering'
    WHEN 'ME'  THEN 'Department of Mechanical Engineering'
    WHEN 'CE'  THEN 'Department of Civil Engineering'
    WHEN 'IPE' THEN 'Department of Industrial and Production Engineering'
    WHEN 'CSE' THEN 'Department of Computer Science and Engineering'
    WHEN 'EEE' THEN 'Department of Electrical and Electronics Engineering'
    WHEN 'WRE' THEN 'Department of Water Resources Engineering'
    WHEN 'URP' THEN 'Department of Urban and Regional Planning'
    ELSE DEPARTMENT_NAME
  END`;

async function totalStudent() {
  try {
    const sql = `SELECT * FROM STUDENT`;
    const result = await database.execute(sql, {});
    const r = result ? result.rows : [];
    r.forEach(element => {
      element.IMAGE = file.findPhotoById(element.STUDENT_ID);
    });
    return r;
  } catch (err) {
    console.error('ERROR in totalStudent:', err.message);
    return [];
  }
}

async function singleStudent(ID) {
  try {
    const sql = `SELECT * FROM STUDENT WHERE STUDENT_ID =: ID`;
    const result = await database.execute(sql, { ID });
    return result ? result.rows : [];
  } catch (err) {
    console.error('ERROR in singleStudent:', err.message);
    return [];
  }
}

async function totalTeacher() {
  try {
    const sql = `SELECT * FROM TEACHER`;
    const result = await database.execute(sql, {});
    const r = result ? result.rows : [];
    r.forEach(element => {
      element.IMAGE = file.findPhotoById(element.TEACHER_ID);
    });
    return r;
  } catch (err) {
    console.error('ERROR in totalTeacher:', err.message);
    return [];
  }
}

async function singleTeacher(ID) {
  try {
    const sql = `SELECT * FROM TEACHER WHERE TEACHER_ID =: ID`;
    const result = await database.execute(sql, { ID });
    return result ? result.rows : [];
  } catch (err) {
    console.error('ERROR in singleTeacher:', err.message);
    return [];
  }
}

async function totalDepartmentTeacherView() {
  try {
    const sql = `
      SELECT
        DEPARTMENT_ID,
        ${FULL_DEPT_NAME_CASE} AS FULL_DEPARTMENT,
        DEPARTMENT_NAME,
        (SELECT COUNT(*) FROM TEACHER WHERE DEPT_ID=DEPARTMENT_ID AND UPPER(TRIM(RANK))='PROFESSOR') AS PROFESSOR_COUNT,
        (SELECT COUNT(*) FROM TEACHER WHERE DEPT_ID=DEPARTMENT_ID AND UPPER(TRIM(RANK))='LECTURER') AS LECTURER_COUNT,
        (SELECT COUNT(*) FROM TEACHER WHERE DEPT_ID=DEPARTMENT_ID AND UPPER(TRIM(RANK))='ASSOCIATE PROFESSOR') AS ASSOCIATE_PROF_COUNT,
        COUNT(DISTINCT TEACHER_ID) AS TOTAL_TEACHER
      FROM DEPARTMENT JOIN TEACHER ON DEPARTMENT.DEPARTMENT_ID = DEPT_ID
      GROUP BY DEPARTMENT_ID, DEPARTMENT_NAME`;
    const result = await database.execute(sql, {});
    return result ? result.rows : [];
  } catch (err) {
    console.error('ERROR in totalDepartmentTeacherView:', err.message);
    return [];
  }
}

async function totalDepartment() {
  try {
    const sql = `
      SELECT
        DEPARTMENT_ID,
        ${FULL_DEPT_NAME_CASE} AS FULL_DEPARTMENT,
        DEPARTMENT_NAME,
        COUNT(DISTINCT STUDENT_ID) AS TOTAL_STUDENTS,
        (SELECT COUNT(*) FROM STUDENT WHERE "LEVEL"='L1' AND TERM='T1' AND DEPT_ID=DEPARTMENT_ID) AS L1_T1,
        (SELECT COUNT(*) FROM STUDENT WHERE "LEVEL"='L1' AND TERM='T2' AND DEPT_ID=DEPARTMENT_ID) AS L1_T2,
        (SELECT COUNT(*) FROM STUDENT WHERE "LEVEL"='L2' AND TERM='T1' AND DEPT_ID=DEPARTMENT_ID) AS L2_T1,
        (SELECT COUNT(*) FROM STUDENT WHERE "LEVEL"='L2' AND TERM='T2' AND DEPT_ID=DEPARTMENT_ID) AS L2_T2,
        (SELECT COUNT(*) FROM STUDENT WHERE "LEVEL"='L3' AND TERM='T1' AND DEPT_ID=DEPARTMENT_ID) AS L3_T1,
        (SELECT COUNT(*) FROM STUDENT WHERE "LEVEL"='L3' AND TERM='T2' AND DEPT_ID=DEPARTMENT_ID) AS L3_T2,
        (SELECT COUNT(*) FROM STUDENT WHERE "LEVEL"='L4' AND TERM='T1' AND DEPT_ID=DEPARTMENT_ID) AS L4_T1,
        (SELECT COUNT(*) FROM STUDENT WHERE "LEVEL"='L4' AND TERM='T2' AND DEPT_ID=DEPARTMENT_ID) AS L4_T2
      FROM DEPARTMENT JOIN STUDENT ON DEPARTMENT.DEPARTMENT_ID = DEPT_ID
      GROUP BY DEPARTMENT_ID, DEPARTMENT_NAME`;
    const result = await database.execute(sql, {});
    return result ? result.rows : [];
  } catch (err) {
    console.error('ERROR in totalDepartment:', err.message);
    return [];
  }
}

module.exports = { totalStudent, totalDepartment, singleStudent, totalDepartmentTeacherView, totalTeacher, singleTeacher };