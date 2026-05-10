const database = require("./database");
async function addDue(d, t) {
  try {
    const sql = `INSERT INTO DUES VALUES(SeqForDues.NEXTVAL,:d,:t)`;
    const binds = { d, t };
    await database.execute(sql, binds);
  } catch (err) {
    console.error('ERROR in addDue:', err.message);
  }
}

async function selectDue() {
  try {
    const sql = `SELECT DUE_ID,DESCRIPTION FROM DUES`;
    const binds = {};
    const result = (await database.execute(sql, binds)).rows;
    return result;
  } catch (err) {
    console.error('ERROR in selectDue:', err.message);
    return [];
  }
}

async function addStudentDue(Did, object) {
  try {
    for (const obj of object) {
      const id = obj.ID.trim();
      const d = obj.PaymentDate.trim();
      const sql = `INSERT INTO STUDENT_DUES VALUES(:id,:Did,TO_DATE(:d, 'DD/MM/YYYY'),'Not Cleared')`;
      const binds = { id, Did, d };
      await database.execute(sql, binds);
    }
  } catch (err) {
    console.error('ERROR in addStudentDue:', err.message);
  }
}

async function updateStudentDue(Did, object) {
  try {
    console.log(object);
    for (const obj of object) {
      const id = obj.ID.trim();
      const sql = `DELETE FROM STUDENT_DUES WHERE STUDENT_ID =:id AND DUES_ID =:Did`;
      const binds = { id, Did };
      await database.execute(sql, binds);
    }
  } catch (err) {
    console.error('ERROR in updateStudentDue:', err.message);
  }
}

//Not cleared

module.exports = { addDue, selectDue, addStudentDue, updateStudentDue };