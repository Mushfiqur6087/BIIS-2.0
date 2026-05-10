const express = require('express');
const router  = express.Router({ mergeParams: true });
const query   = require('../../Database/STUDENT/advisor');
const file    = require('../../config/findImage');

// GET /api/student/advisor
router.get('/', async (req, res) => {
  const info = await query.advisorInformation(req.user.STUDENT_ID);
  if (!info || !info[0]) return res.json({ advisor: null });
  const advisor = { ...info[0] };
  advisor.image = file.findPhotoById(advisor.TEACHER_ID);
  res.json({ advisor });
});

module.exports = router;