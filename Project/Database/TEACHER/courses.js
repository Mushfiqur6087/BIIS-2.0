const database = require("../database");

async function viewCourses(id) {
  const s = "waiting for approval";
  const sql = `
    SELECT ENROLLMENT.STUDENT_ID,
           CONCAT(CONCAT(STUDENT.FIRST_NAME,' '), STUDENT.LAST_NAME) AS NAME,
           ENROLLMENT.COURSE_ID, COURSE.TITLE, COURSE."LEVEL", COURSE."TERM"
    FROM ADVISOR
    JOIN ENROLLMENT ON S_ID = ENROLLMENT.STUDENT_ID
    JOIN COURSE ON COURSE.COURSE_ID = ENROLLMENT.COURSE_ID
    JOIN STUDENT ON STUDENT.STUDENT_ID = ENROLLMENT.STUDENT_ID
    WHERE I_ID=:id AND ENROLLMENT.STATUS=:s
    ORDER BY ENROLLMENT.COURSE_ID`;
  try {
    return (await database.execute(sql, { id, s })).rows;
  } catch (err) {
    console.error('ERROR in viewCourses:', err.message);
    return [];
  }
}

async function changeCourseStauts(courses) {
  for (let i = 0; i < courses.length; i++) {
    const parts = courses[i].split(" ");
    const p = parts[0].trim();
    const t = parts.slice(1).join(" ").trim();
    const s = 'approved';
    const sql = `UPDATE ENROLLMENT SET STATUS=:s WHERE STUDENT_ID=:p AND COURSE_ID=:t`;
    await database.execute(sql, { s, p, t });
  }
}

async function createNewCourse(cid, dName, ttle, c, l, t) {
  // GET_DEPARTMENT_ID(:dname) replaced with inline subquery (Oracle function invalid state)
  const sql = `INSERT INTO COURSE VALUES(:cid,
    (SELECT DEPARTMENT_ID FROM DEPARTMENT WHERE DEPARTMENT_NAME=:dName),
    :ttle, TO_NUMBER(:c), :l, :t)`;
  try {
    await database.execute(sql, { cid, dName, ttle, c, l, t });
  } catch (err) {
    console.error('ERROR in createNewCourse:', err.message);
  }
}

module.exports = { viewCourses, changeCourseStauts, createNewCourse };
