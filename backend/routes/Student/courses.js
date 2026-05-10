const express = require('express');
const router  = express.Router({ mergeParams: true });
const query   = require('../../Database/STUDENT/course');

// GET /api/student/courses
router.get('/', async (req, res) => {
  const st     = await query.getRegistrationStatus();
  const status = st[0]?.REGISTRATION_STATUS || 'Close';
  if (status !== 'Open') return res.json({ registrationOpen: false, courses: [], approvedCourses: [] });

  const courses         = await query.getCourses(req.user.STUDENT_ID);
  const approvedCourses = await query.getApprovedCourses(req.user.STUDENT_ID);
  const header = { level: req.user.LEVEL, term: req.user.TERM };
  res.json({ registrationOpen: true, courses, approvedCourses, header });
});

module.exports = router;
