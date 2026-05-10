const express = require('express');
const bcrypt  = require('bcrypt');
const router  = express.Router({ mergeParams: true });
const query   = require('../../Database/TEACHER/createUser');
const db      = require('../../Database/database');

// POST /api/admin/add-teacher
router.post('/', async (req, res) => {
  const { ID, PASSWORD, firstName, lastName, deptID } = req.body;
  const hashPWD = await bcrypt.hash(PASSWORD, 10);
  await query.insertInformation(ID, hashPWD, firstName, lastName, deptID);
  if (db.ErrorMsg.showError)
    return res.status(403).json({ error: 'Insert failed. Check: ID uniqueness, dept exists.' });
  res.json({ success: true });
});

module.exports = router;