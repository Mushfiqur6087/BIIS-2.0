const file = require("../../config/findImage");
const database = require("../database");

async function getStudentInfo(id) {
  try {
    // Inline CASE replaces GET_FULL_DEPARTMENT_NAME (Oracle function in invalid state)
    const sql = `
      SELECT
        (FIRST_NAME || ' ' || LAST_NAME) AS FULLNAME,
        STUDENT_ID,
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
        END AS DEPT_NAME,
        CONCAT(CONCAT(CONCAT('Level: ', "LEVEL"), ' '), CONCAT('Term: ', TERM)) AS lt,
        HALL
      FROM STUDENT
      JOIN DEPARTMENT ON DEPARTMENT_ID = DEPT_ID
      WHERE STUDENT_ID = :id`;
    const result = await database.execute(sql, { id });
    const r = result.rows[0];
    if (r) r.image = file.findPhotoById(id);
    return r;
  } catch (err) {
    console.error('ERROR in getStudentInfo:', err.message);
    return null;
  }
}

module.exports = { getStudentInfo };