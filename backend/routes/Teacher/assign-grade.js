const express = require('express');
const router  = express.Router({ mergeParams: true });
const query   = require('../../Database/TEACHER/grade');
const query2  = require('../../Database/STUDENT/course');

let course; // temp state — stateless in prod via body

// GET /api/teacher/grades — list courses awaiting grading
router.get('/', async (req, res) => {
  const options = await query.addgrade(req.user.TEACHER_ID);
  const st      = await query2.getRegistrationStatus();
  const registrationOpen = st[0]?.REGISTRATION_STATUS === 'Open';
  res.json({ options, registrationOpen });
});

// POST /api/teacher/grades/students — get student list for a course
router.post('/students', async (req, res) => {
  course = req.body.courseId;
  const studentList = await query.addCGPA(req.user.TEACHER_ID, course);
  res.json({ studentList, courseId: course });
});

// POST /api/teacher/grades/submit — submit grades
router.post('/submit', async (req, res) => {
  const submittedGrades = req.body['grades[]'];
  const courseId        = req.body.courseId || course;
  const grades          = Array.isArray(submittedGrades) ? submittedGrades : [submittedGrades];
  await query.updateGrade(grades, courseId, req.user.TEACHER_ID);
  res.json({ success: true });
});

module.exports = router;