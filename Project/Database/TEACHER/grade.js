const database = require("../database");

async function addgrade(id) {
  const t = "Not Graded";
  const e = "approved";
  const sql = `
    SELECT ID, TEACHES.COURSE_ID, COUNT(ENROLLMENT.STUDENT_ID) AS STUDENT_COUNT
    FROM TEACHES JOIN ENROLLMENT ON TEACHES.COURSE_ID = ENROLLMENT.COURSE_ID
    WHERE TEACHES.STATUS=:t AND ENROLLMENT.STATUS=:e AND ID=:id
    GROUP BY ID, TEACHES.COURSE_ID`;
  try {
    return (await database.execute(sql, { t, e, id })).rows;
  } catch (err) {
    console.error('ERROR in addgrade:', err.message);
    return [];
  }
}

async function addCGPA(id, cid) {
  const t = "Not Graded";
  const e = "approved";
  const sql = `
    SELECT ENROLLMENT.STUDENT_ID,
           CONCAT(CONCAT(STUDENT.FIRST_NAME,' '), STUDENT.LAST_NAME) AS NAME,
           TEACHES.COURSE_ID
    FROM ENROLLMENT
    JOIN TEACHES ON ENROLLMENT.COURSE_ID = TEACHES.COURSE_ID
    JOIN STUDENT ON ENROLLMENT.STUDENT_ID = STUDENT.STUDENT_ID
    WHERE ID=:id AND TEACHES.COURSE_ID=:cid
      AND ENROLLMENT.STATUS=:e AND TEACHES.STATUS=:t`;
  try {
    return (await database.execute(sql, { id, cid, t, e })).rows;
  } catch (err) {
    console.error('ERROR in addCGPA:', err.message);
    return [];
  }
}

async function updateGrade(g, cid, tid) {
  for (let i = 0; i < g.length; i++) {
    const item  = g[i].trim();
    const parts = item.split(/\s+/);
    const id    = parts[0];
    const grade = parts[1];
    const st    = 'Graded';
    const sql   = `UPDATE ENROLLMENT SET GRADE=:grade, STATUS=:st WHERE STUDENT_ID=:id AND COURSE_ID=:cid`;
    // FIXED: was "database.execute(sql, binds).rows" — .rows called on Promise, not result
    await database.execute(sql, { st, id, grade, cid });
  }

  const st  = 'Graded';
  const sql = `UPDATE TEACHES SET STATUS=:st WHERE ID=:tid AND COURSE_ID=:cid`;
  // FIXED: was "await database.execute(sql,binds).rows" — same bug, also unnecessary .rows on UPDATE
  await database.execute(sql, { st, tid, cid });
}

module.exports = { addgrade, addCGPA, updateGrade };
