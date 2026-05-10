const database = require("../database");

async function getCourses(id) {
  try {
    const result = (await database.execute(
      `SELECT STUDENT_ID,"LEVEL",TERM,DEPT_ID FROM STUDENT WHERE STUDENT_ID=:id`, { id }
    )).rows;
    if (!result || !result[0]) return []; // student not found

    const { LEVEL: leve, TERM: ter, DEPT_ID: deptID, STUDENT_ID: sID } = result[0];
    return (await database.execute(
      `SELECT COURSE_ID, CREDIT, TITLE FROM COURSE
       WHERE "LEVEL"=:leve AND "TERM"=:ter AND DEPT_ID=:deptID
         AND COURSE_ID NOT IN (SELECT COURSE_ID FROM ENROLLMENT WHERE STUDENT_ID=:sID)`,
      { leve, ter, deptID, sID }
    )).rows;
  } catch (err) {
    console.error('ERROR in getCourses:', err.message);
    return [];
  }
}

async function getApprovedCourses(id) {
  try {
    const st = 'approved';
    return (await database.execute(
      `SELECT COURSE.COURSE_ID, COURSE.TITLE, COURSE.CREDIT
       FROM ENROLLMENT JOIN COURSE ON ENROLLMENT.COURSE_ID=COURSE.COURSE_ID
       WHERE STUDENT_ID=:id AND STATUS=:st`, { id, st }
    )).rows;
  } catch (err) {
    console.error('ERROR in getApprovedCourses:', err.message);
    return [];
  }
}

async function getRegistrationStatus() {
  try {
    return (await database.execute(`SELECT REGISTRATION_STATUS FROM REGISTRATION`, {})).rows;
  } catch (err) {
    console.error('ERROR in getRegistrationStatus:', err.message);
    return [];
  }
}

async function changeRegistrationStatus(status) {
  try {
    if (status === 'Open') {
      await database.execute(`UPDATE REGISTRATION SET REGISTRATION_STATUS=:b`, { b: 'Open' });
    }
    if (status === 'Close') {
      await database.execute(`UPDATE REGISTRATION SET REGISTRATION_STATUS=:b`, { b: 'Close' });
      await database.execute(
        `UPDATE ENROLLMENT SET STATUS=:c WHERE STATUS=:d`,
        { c: 'approved', d: 'waiting for approval' }
      );
    }
  } catch (err) {
    console.error('ERROR in changeRegistrationStatus:', err.message);
  }
}

async function getNotGradedCount() {
  try {
    return (await database.execute(
      `SELECT COUNT(*) AS count FROM ENROLLMENT WHERE STATUS='waiting for approval'`, {}
    )).rows;
  } catch (err) {
    console.error('ERROR in getNotGradedCount:', err.message);
    return [];
  }
}

async function levelTermUpdate() {
  try {
    return (await database.execute(
      `DELETE FROM STUDENT WHERE "LEVEL"='GD' AND TERM='GD'`, {}
    )).rows;
  } catch (err) {
    console.error('ERROR in levelTermUpdate:', err.message);
    return [];
  }
}

module.exports = { getCourses, getApprovedCourses, getRegistrationStatus, changeRegistrationStatus, getNotGradedCount, levelTermUpdate };