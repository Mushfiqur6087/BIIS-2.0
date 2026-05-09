const database = require("../database");

async function getScholarshipInformaton() {
  try {
    return (await database.execute(`SELECT * FROM SCHOLARSHIP`, {})).rows;
  } catch (err) {
    console.error('ERROR in getScholarshipInformaton:', err.message);
    return [];
  }
}

async function getScholarshipStatus(id) {
  try {
    // Removed spurious database.startup() call — pool is already created at app boot
    return (await database.execute(
      `SELECT STATUS FROM STUDENT_SCHOLARSHIP WHERE STUDENT_ID=:id`, { id }
    )).rows;
  } catch (err) {
    console.error('ERROR in getScholarshipStatus:', err.message);
    return [];
  }
}

async function addStudentScholarshipApplication(id, sid) {
  try {
    const a = (await database.execute(
      `SELECT * FROM ADVISOR WHERE S_ID=:id`, { id }
    )).rows;
    if (!a || !a[0]) throw new Error(`No advisor found for student ${id}`);
    const aID = a[0].I_ID;
    const t   = 'waiting for approval';
    return (await database.execute(
      `INSERT INTO STUDENT_SCHOLARSHIP(STUDENT_ID,SCHOLARSHIP_ID,STATUS,TEACHER_ID) VALUES(:id,:sid,:t,:aID)`,
      { id, sid, aID, t }
    )).rows;
  } catch (err) {
    console.error('ERROR in addStudentScholarshipApplication:', err.message);
    return [];
  }
}

async function getStudentDues(id) {
  try {
    // Removed spurious database.startup() call
    const st = 'Not Cleared';
    return (await database.execute(
      `SELECT * FROM DUES JOIN STUDENT_DUES ON DUES.DUE_ID=STUDENT_DUES.DUES_ID
       WHERE STUDENT_ID=:id AND STATUS=:st`, { id, st }
    )).rows;
  } catch (err) {
    console.error('ERROR in getStudentDues:', err.message);
    return [];
  }
}

module.exports = { getScholarshipInformaton, addStudentScholarshipApplication, getScholarshipStatus, getStudentDues };