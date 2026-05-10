const express = require('express');
const router  = express.Router({ mergeParams: true });
const query   = require('../../Database/STUDENT/scholarship&dues');

// GET /api/student/dues
router.get('/', async (req, res) => {
  const items = await query.getStudentDues(req.user.STUDENT_ID);
  res.json({ dues: items });
});

module.exports = router;