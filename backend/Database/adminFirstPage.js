const database = require("./database");

async function totalStudentDepartMent() {
  const sql = `
  SELECT
    d.DEPARTMENT_NAME,
    (SELECT COUNT(DISTINCT s.STUDENT_ID) FROM STUDENT s WHERE s.DEPT_ID = d.DEPARTMENT_ID) AS TOTAL_STUDENTS,
    (SELECT COUNT(DISTINCT t.TEACHER_ID) FROM TEACHER t WHERE t.DEPT_ID = d.DEPARTMENT_ID) AS TOTAL_TEACHERS
FROM
    DEPARTMENT d
  `;
  try {
    const result = await database.execute(sql, {});
    return result ? result.rows : [];
  } catch (err) {
    console.error('ERROR in totalStudentDepartMent:', err.message);
    return [];
  }
}

async function totalStudentCourse() {
  // Inline max_enrollment instead of calling CHECK_MAX_ENROLLMENT (function is in invalid state)
  const sql = `
  SELECT
    DEPARTMENT.DEPARTMENT_NAME,
    COURSE.COURSE_ID,
    (SELECT COUNT(*) FROM STUDENT
     WHERE STUDENT."LEVEL" = COURSE."LEVEL"
       AND STUDENT.TERM   = COURSE.TERM
       AND STUDENT.DEPT_ID = COURSE.DEPT_ID) AS max_enrollment,
    (SELECT COUNT(*) FROM ENROLLMENT WHERE ENROLLMENT.COURSE_ID = COURSE.COURSE_ID) AS current_enrollment,
    (SELECT COUNT(*) FROM TEACHES WHERE TEACHES.COURSE_ID = COURSE.COURSE_ID) AS total_teachers
  FROM COURSE
  JOIN DEPARTMENT ON DEPARTMENT.DEPARTMENT_ID = COURSE.DEPT_ID
  `;
  try {
    const result = await database.execute(sql, {});
    return result ? result.rows : [];
  } catch (err) {
    console.error('ERROR in totalStudentCourse:', err.message);
    return [];
  }
}

module.exports = { totalStudentDepartMent, totalStudentCourse }



