const database = require("../database");

async function advisorInformation(id) {
  try {
    const a = (await database.execute(
      `SELECT I_ID FROM ADVISOR WHERE S_ID=:id`, { id }
    )).rows;
    if (!a || !a[0]) return null; // student has no advisor assigned
    const a_id = a[0].I_ID;
    return (await database.execute(
      `SELECT * FROM TEACHER WHERE TEACHER_ID=:a_id`, { a_id }
    )).rows;
  } catch (err) {
    console.error('ERROR in advisorInformation:', err.message);
    return null;
  }
}

module.exports = { advisorInformation };