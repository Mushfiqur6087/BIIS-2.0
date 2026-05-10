const database = require('../database');

async function addScholarship(t, d, a) {
  try {
    const sql   = `INSERT INTO SCHOLARSHIP VALUES(:t,:d,SeqForScholarship.NEXTVAL,:a)`;
    const binds = { t, d, a };
    await database.execute(sql, binds);
  } catch (err) {
    console.error('ERROR in addScholarship:', err.message);
  }
}

module.exports = { addScholarship };
