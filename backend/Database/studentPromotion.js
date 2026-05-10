const database = require("./database");

// Inline replacement for GET_PASS_OR_FAIL_STATUS and GET_NEXT_LEVEL_TERM_PROCEDURE
// Both Oracle procedures are in invalid state (exported without parameter signatures)

function nextLevelTerm(level, term) {
  const map = {
    'L1T1':['L1','T2'], 'L1T2':['L2','T1'],
    'L2T1':['L2','T2'], 'L2T2':['L3','T1'],
    'L3T1':['L3','T2'], 'L3T2':['L4','T1'],
    'L4T1':['L4','T2'], 'L4T2':['GD','GD'],
  };
  return map[level + term] || ['GD', 'GD'];
}

async function updateTeaches() {
  await database.execute(
    `UPDATE TEACHES SET STATUS='Not Graded' WHERE COURSE_ID IN (SELECT DISTINCT(COURSE_ID) FROM ENROLLMENT)`,
    {}
  );
}

async function studentPromotion(ID) {
  // Replaces GET_PASS_OR_FAIL_STATUS procedure (invalid state) with direct SQL
  const passFailSql = `
    SELECT
      CASE
        WHEN COUNT(CASE WHEN GRADE = 'F' THEN 1 END) > 0 THEN 'Failed'
        WHEN COUNT(CASE WHEN GRADE IS NOT NULL THEN 1 END) > 0 THEN 'Passed'
        ELSE 'Not in table'
      END AS MSG
    FROM ENROLLMENT WHERE STUDENT_ID = :ID AND STATUS = 'Graded'`;
  const pfResult = await database.execute(passFailSql, { ID });
  const result = pfResult.rows[0] ? pfResult.rows[0].MSG : 'Not in table';

  if (result === 'Passed') {
    const course_grade = (await database.execute(
      `SELECT COURSE_ID, GRADE FROM ENROLLMENT WHERE STATUS='Graded' AND STUDENT_ID=:ID`, { ID }
    )).rows;
    const level_term = (await database.execute(
      `SELECT "LEVEL", TERM FROM STUDENT WHERE STUDENT_ID=:ID`, { ID }
    )).rows;

    if (!level_term[0]) return;
    const curLevel = level_term[0].LEVEL;
    const curTerm  = level_term[0].TERM;

    for (const obj of course_grade) {
      await database.execute(
        `INSERT INTO RESULT VALUES(:id,:cid,:g,:l,:t)`,
        { id: ID, cid: obj.COURSE_ID, g: obj.GRADE, l: curLevel, t: curTerm }
      );
    }
    await database.execute(`DELETE FROM ENROLLMENT WHERE STUDENT_ID=:id`, { id: ID });

    // Replaces GET_NEXT_LEVEL_TERM_PROCEDURE (invalid state) with JS mapping
    const [new_L, new_T] = nextLevelTerm(curLevel, curTerm);
    await database.execute(
      `UPDATE STUDENT SET "LEVEL"=:l, TERM=:t WHERE STUDENT_ID=:id`,
      { id: ID, l: new_L, t: new_T }
    );
  }

  if (result === 'Failed') {
    const course_grade = (await database.execute(
      `SELECT COURSE_ID, GRADE FROM ENROLLMENT WHERE STATUS='Graded' AND STUDENT_ID=:ID`, { ID }
    )).rows;
    const level_term = (await database.execute(
      `SELECT "LEVEL", TERM FROM STUDENT WHERE STUDENT_ID=:ID`, { ID }
    )).rows;

    if (!level_term[0]) return;
    for (const obj of course_grade) {
      await database.execute(
        `INSERT INTO RESULT VALUES(:id,:cid,:g,:l,:t)`,
        { id: ID, cid: obj.COURSE_ID, g: obj.GRADE, l: level_term[0].LEVEL, t: level_term[0].TERM }
      );
    }
    await database.execute(
      `DELETE FROM ENROLLMENT WHERE STUDENT_ID=:id AND GRADE=:f`,
      { id: ID, f: 'F' }
    );
  }
}

module.exports = { studentPromotion, updateTeaches };
