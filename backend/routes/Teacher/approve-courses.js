const express = require('express');
const router  = express.Router({ mergeParams: true });
const query   = require('../../Database/TEACHER/courses');

// GET /api/teacher/approve-courses
router.get('/', async (req, res) => {
  const courses = await query.viewCourses(req.user.TEACHER_ID);
  res.json({ courses });
});

// POST /api/teacher/approve-courses
router.post('/', async (req, res) => {
  let courses = req.body['selectedItems[]'];
  if (!Array.isArray(courses)) courses = [courses];
  await query.changeCourseStauts(courses);
  res.json({ success: true });
});

module.exports = router;
