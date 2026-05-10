const database = require("../database");

// Inline replacement for CONVERTGRADETOPOINT (Oracle function in invalid state)
function gradeToPoint(grade) {
  const map = { 'A+':4.00,'A':3.75,'A-':3.50,'B+':3.25,'B':3.00,'B-':2.75,'C+':2.50,'C':2.25,'C-':2.15,'F':0.00 };
  return map[grade] ?? 0.00;
}

async function viewGrede(id, l, t) {
  // CONVERTGRADETOPOINT replaced with inline CASE (Oracle function is invalid)
  const sql = `
    SELECT COURSE.COURSE_ID, TITLE, CREDIT, GRADE,
      CASE GRADE
        WHEN 'A+' THEN 4.00  WHEN 'A'  THEN 3.75  WHEN 'A-' THEN 3.50
        WHEN 'B+' THEN 3.25  WHEN 'B'  THEN 3.00  WHEN 'B-' THEN 2.75
        WHEN 'C+' THEN 2.50  WHEN 'C'  THEN 2.25  WHEN 'C-' THEN 2.15
        WHEN 'F'  THEN 0.00  ELSE 0.00
      END AS G
    FROM RESULT JOIN COURSE ON COURSE.COURSE_ID = RESULT.COURSE_ID
    WHERE STUDENT_ID = :id AND COURSE."LEVEL" = :l AND COURSE.TERM = :t`;
  try {
    return (await database.execute(sql, { id, l, t })).rows;
  } catch (err) {
    console.error('ERROR in viewGrede:', err.message);
    return [];
  }
}

// Inline replacement for GET_TOTAL_CGPA_PROCEDURE (Oracle procedure in invalid state)
// Computes CGPA for a specific level+term from the RESULT table
async function levelTermCg(id, l, t) {
  try {
    const sql = `
      SELECT GRADE, CREDIT FROM RESULT
      JOIN COURSE ON COURSE.COURSE_ID = RESULT.COURSE_ID
      WHERE RESULT.STUDENT_ID = :id AND RESULT."LEVEL" = :l AND RESULT.TERM = :t`;
    const rows = (await database.execute(sql, { id, l, t })).rows;
    let totalPoints = 0, totalCredits = 0;
    for (const r of rows) {
      totalPoints += gradeToPoint(r.GRADE) * Number(r.CREDIT);
      totalCredits += Number(r.CREDIT);
    }
    return { msg: totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0 };
  } catch (err) {
    console.error('ERROR in levelTermCg:', err.message);
    return { msg: 0 };
  }
}

// Inline replacement for GET_TOTAL_CGPA_ALL_TERM (Oracle procedure in invalid state)
// Computes CGPA across all terms from the RESULT table
async function totalCGPA(id) {
  try {
    const sql = `
      SELECT GRADE, CREDIT FROM RESULT
      JOIN COURSE ON COURSE.COURSE_ID = RESULT.COURSE_ID
      WHERE RESULT.STUDENT_ID = :id`;
    const rows = (await database.execute(sql, { id })).rows;
    let totalPoints = 0, totalCredits = 0;
    for (const r of rows) {
      totalPoints += gradeToPoint(r.GRADE) * Number(r.CREDIT);
      totalCredits += Number(r.CREDIT);
    }
    return { msg: totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0 };
  } catch (err) {
    console.error('ERROR in totalCGPA:', err.message);
    return { msg: 0 };
  }
}

module.exports = { viewGrede, totalCGPA, levelTermCg };
