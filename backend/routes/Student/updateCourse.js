const express = require('express');
const router  = express.Router({ mergeParams: true });
const query   = require('../../Database/STUDENT/insertStudent');

// POST /api/student/enroll
router.post('/', async (req, res) => {
  let courses = req.body['selectedItems[]'];
  if (!Array.isArray(courses)) courses = [courses];
  await query.insertIntoEnrollMent(req.user.STUDENT_ID, courses, req.user.LEVEL, req.user.TERM);
  res.json({ success: true });
});

module.exports = router;