const express = require('express');
const router  = express.Router({ mergeParams: true });
const query   = require('../../Database/STUDENT/course');
const query2  = require('../../Database/STUDENT/studentCourseInfo');
const query3  = require('../../Database/studentPromotion');

// GET /api/admin/promote — promotion data
router.get('/', async (req, res) => {
  const count       = (await query.getNotGradedCount())[0];
  const count2      = await query2.getFailedSttudent();
  const studentIDs  = await query2.getID();
  const resultArray = [];
  for (const element of studentIDs) {
    const result = await query2.studentCourse(element['STUDENT_ID']);
    if (result !== -1) resultArray.push(result);
  }
  res.json({ count, resultArray, failedStudents: count2 });
});

// POST /api/admin/promote — run promotion
router.post('/', async (req, res) => {
  await query3.updateTeaches();
  const totalStudent = await query2.getID();
  for (const obj of totalStudent) {
    await query.changeRegistrationStatus('Open');
    await query3.studentPromotion(obj.STUDENT_ID);
  }
  await query.levelTermUpdate();
  res.json({ success: true });
});

module.exports = router;
