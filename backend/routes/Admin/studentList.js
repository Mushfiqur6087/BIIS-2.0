const express = require('express');
const router  = express.Router({ mergeParams: true });
const query   = require('../../Database/adminStudentTeacherList');
const query2  = require('../../Database/adminDelete');

// GET /api/admin/students — full list + departments
router.get('/', async (req, res) => {
  const studentList    = await query.totalStudent();
  const departmentList = await query.totalDepartment();
  res.json({ studentList, departmentList });
});

// GET /api/admin/students/:id — single student detail
router.get('/:id', async (req, res) => {
  const std     = await query.singleStudent(req.params.id);
  const student = std[0] || null;
  res.json({ student });
});

// DELETE /api/admin/students/:id — remove student
router.delete('/:id', async (req, res) => {
  await query2.deleteStudent(req.params.id);
  res.json({ success: true });
});

module.exports = router;