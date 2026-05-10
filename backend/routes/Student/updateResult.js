const express = require('express');
const router  = express.Router({ mergeParams: true });
const query   = require('../../Database/STUDENT/result');

// GET /api/student/results/detail?level=L1&term=T1
router.get('/', async (req, res) => {
  const { level, term } = req.query;
  if (!level || !term) return res.status(400).json({ error: 'level and term query params required' });
  const grades   = await query.viewGrede(req.user.STUDENT_ID, level, term);
  const termCgpa = await query.levelTermCg(req.user.STUDENT_ID, level, term);
  const totalCgpa = await query.totalCGPA(req.user.STUDENT_ID);
  res.json({ grades, termCgpa: termCgpa.msg, totalCgpa: totalCgpa.msg, level, term });
});

module.exports = router;