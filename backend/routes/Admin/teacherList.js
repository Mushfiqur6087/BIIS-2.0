const express = require('express');
const router  = express.Router({ mergeParams: true });
const query   = require('../../Database/adminStudentTeacherList');
const query2  = require('../../Database/adminDelete');

// GET /api/admin/teachers
router.get('/', async (req, res) => {
  const teacherList    = await query.totalTeacher();
  const departmentList = await query.totalDepartmentTeacherView();
  res.json({ teacherList, departmentList });
});

// GET /api/admin/teachers/:id
router.get('/:id', async (req, res) => {
  const std     = await query.singleTeacher(req.params.id);
  const teacher = std[0] || null;
  res.json({ teacher });
});

// DELETE /api/admin/teachers/:id
router.delete('/:id', async (req, res) => {
  const ok = await query2.deleteTeacher(req.params.id);
  if (!ok) return res.status(403).json({ error: 'Cannot delete teacher — still assigned to courses.' });
  res.json({ success: true });
});

module.exports = router;