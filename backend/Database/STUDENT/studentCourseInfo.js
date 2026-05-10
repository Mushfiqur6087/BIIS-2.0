const database = require("../database");

// Inline replacement for STUDENT_COURSE_STATUS procedure (invalid state)
// That procedure also called COURSES_STUDENT_CAN_TAKE and
// GET_NEXT_LEVEL_TERM_NAME_FOR_COURSE_STATUS_PROCEDURE — both also invalid.

function nextLevelTermLabel(levelTerm) {
  const labels = {
    'L1T1': 'Student will get promoted to LEVEL: L1 and TERM: T2',
    'L1T2': 'Student will get promoted to LEVEL: L2 and TERM: T1',
    'L2T1': 'Student will get promoted to LEVEL: L2 and TERM: T2',
    'L2T2': 'Student will get promoted to LEVEL: L3 and TERM: T1',
    'L3T1': 'Student will get promoted to LEVEL: L3 and TERM: T2',
    'L3T2': 'Student will get promoted to LEVEL: L4 and TERM: T1',
    'L4T1': 'Student will get promoted to LEVEL: L4 and TERM: T2',
    'L4T2': 'Student will graduate if he/she does not have any backlog',
  };
  return labels[levelTerm] || 'Unknown level and term';
}

async function studentCourse(ID) {
  try {
    // Check for failed courses
    const statusResult = (await database.execute(
      `SELECT COUNT(*) AS COUNT FROM ENROLLMENT WHERE STUDENT_ID=:id AND GRADE='F'`, { id: ID }
    )).rows;
    if (!statusResult[0] || statusResult[0].COUNT !== '0' && Number(statusResult[0].COUNT) !== 0) {
      return -1;
    }

    // Get student level/term
    const ltResult = (await database.execute(
      `SELECT "LEVEL", TERM FROM STUDENT WHERE STUDENT_ID=:id`, { id: ID }
    )).rows;
    if (!ltResult[0]) return -1;
    const L = ltResult[0].LEVEL;
    const T = ltResult[0].TERM;

    // Count courses available for student (COURSES_STUDENT_CAN_TAKE logic)
    const courseCountResult = (await database.execute(
      `SELECT COUNT(*) AS S_COURSE_COUNT FROM COURSE
       WHERE DEPT_ID=(SELECT DEPT_ID FROM STUDENT WHERE STUDENT_ID=:id)
       AND "LEVEL"=:l AND TERM=:t`, { id: ID, l: L, t: T }
    )).rows;
    const courseCount = courseCountResult[0] ? courseCountResult[0].S_COURSE_COUNT : 0;

    // Count enrolled courses
    const enrolledResult = (await database.execute(
      `SELECT COUNT(*) AS ST1 FROM ENROLLMENT WHERE STUDENT_ID=:id`, { id: ID }
    )).rows;
    const st1 = enrolledResult[0] ? enrolledResult[0].ST1 : 0;

    return {
      sid:  ID,
      msg1: `Student ${ID} took in ${courseCount} courses`,
      msg2: `Student Passed in total ${st1} courses`,
      msg3: `Student is currently studying in LEVEL: ${L} and TERM: ${T}`,
      msg4: nextLevelTermLabel(L + T),
    };
  } catch (err) {
    console.error('ERROR in studentCourse:', err.message);
    return -1;
  }
}

async function getID() {
  try {
    const result = await database.execute(
      `SELECT DISTINCT(STUDENT_ID) FROM ENROLLMENT WHERE STATUS=:e`, { e: 'Graded' }
    );
    const rows = result.rows;
    return (rows.length === 1) ? [rows] : rows;
  } catch (err) {
    console.error('ERROR in getID:', err.message);
    return [];
  }
}

async function getFailedSttudent() {
  try {
    const result = await database.execute(
      `SELECT DISTINCT(STUDENT_ID), COUNT(COURSE_ID) AS COURSE_COUNT
       FROM ENROLLMENT WHERE STATUS=:e AND GRADE='F' GROUP BY STUDENT_ID`,
      { e: 'Graded' }
    );
    const rows = result.rows;
    return (rows.length === 1) ? [rows] : rows;
  } catch (err) {
    console.error('ERROR in getFailedSttudent:', err.message);
    return [];
  }
}

module.exports = { studentCourse, getID, getFailedSttudent };