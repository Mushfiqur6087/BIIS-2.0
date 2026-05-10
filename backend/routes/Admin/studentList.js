const express = require('express');
const router  = express.Router({ mergeParams: true });
const query   = require('../../Database/adminStudentTeacherList');
const query2  = require('../../Database/adminDelete');
const db      = require('../../Database/database');

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

// PATCH /api/admin/students/:id — update student editable fields
router.patch('/:id', async (req, res) => {
  const { PHONE_NO, PHONE_NO2, EMAIL, ADDRESS, HALL, NID } = req.body;
  try {
    await db.execute(
      `UPDATE STUDENT SET
         PHONE_NO=:PHONE_NO, PHONE_NO2=:PHONE_NO2, EMAIL=:EMAIL,
         ADDRESS=:ADDRESS, HALL=:HALL, NID=:NID
       WHERE STUDENT_ID=:ID`,
      { PHONE_NO, PHONE_NO2, EMAIL, ADDRESS, HALL, NID, ID: req.params.id }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/students/:id — remove student
router.delete('/:id', async (req, res) => {
  await query2.deleteStudent(req.params.id);
  res.json({ success: true });
});

module.exports = router;