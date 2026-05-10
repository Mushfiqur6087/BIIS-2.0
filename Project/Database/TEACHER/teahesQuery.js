const database = require("../database");

async function insertTeaches(id, cid) {
  try {
    console.log(id, cid);
    const st = 'Not Graded';
    const sql = `INSERT INTO TEACHES VALUES(:id,:cid,:st)`;
    const binds = { id, cid, st };
    await database.execute(sql, binds);
  } catch (err) {
    console.error('ERROR in insertTeaches:', err.message);
  }
}

async function insertTeachesMany(result) {
  try {
    for (const object of result) {
      const id = object.ID.trim();
      const cid = object.CourseCode.trim();
      const st = object.Status.trim();
      const sql = `INSERT INTO TEACHES VALUES(:id,:cid,:st)`;
      const binds = { id, cid, st };
      await database.execute(sql, binds);
    }
  } catch (err) {
    console.error('ERROR in insertTeachesMany:', err.message);
  }
}

module.exports = { insertTeaches, insertTeachesMany };