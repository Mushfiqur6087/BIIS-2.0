const database = require("../database");

async function viewScholarship(id) {
  try {
    const sql = `
      SELECT STUDENT_ID, STUDENT_SCHOLARSHIP.SCHOLARSHIP_ID, SCHOLARSHIP_TITLE, AMOUNT
      FROM STUDENT_SCHOLARSHIP
      JOIN SCHOLARSHIP ON STUDENT_SCHOLARSHIP.SCHOLARSHIP_ID = SCHOLARSHIP.SCHOLARSHIP_ID
      WHERE TEACHER_ID = :id AND STUDENT_SCHOLARSHIP.STATUS = :St
    `;
    const st = 'waiting for approval';
    const binds = { id, st };
    return (await database.execute(sql, binds)).rows;
  } catch (err) {
    console.error('ERROR in viewScholarship:', err.message);
    return [];
  }
}

async function changeScholarshipStatus(courses) {
  try {
    for (let i = 0; i < courses.length; i++) {
      const parts = courses[i].split(" ");
      console.log(parts);
      const p = parts[0].trim();
      const t = parts.slice(1).join(" ").trim();
      const s = 'approved';
      const sql = `
        UPDATE STUDENT_SCHOLARSHIP 
        SET STATUS = :s
        WHERE STUDENT_ID = :p AND SCHOLARSHIP_ID = :t
      `;
      const binds = { s, p, t };
      await database.execute(sql, binds);
    }
  } catch (err) {
    console.error('ERROR in changeScholarshipStatus:', err.message);
  }
}

module.exports = { viewScholarship, changeScholarshipStatus };