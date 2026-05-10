const express = require('express');
const router  = express.Router({ mergeParams: true });
const query   = require('../../Database/TEACHER/courses');
const db      = require('../../Database/database');

// POST /api/admin/courses
router.post('/', async (req, res) => {
  const courseID  = req.body.option[0] + ' ' + req.body.courseID.trim();
  const deptID    = req.body.option[1];
  const credit    = req.body.option[2];
  const levelTerm = req.body.option[3];
  const level     = levelTerm.substring(0, 2).trim();
  const term      = levelTerm.substring(2).trim();
  await query.createNewCourse(courseID, deptID, req.body.courseTitle, credit, level, term);
  if (db.ErrorMsg.showError)
    return res.status(403).json({ error: 'Course creation failed.' });
  res.json({ success: true });
});

module.exports = router;