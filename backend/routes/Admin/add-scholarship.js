const express = require('express');
const router  = express.Router({ mergeParams: true });
const query   = require('../../Database/TEACHER/scholarship');

// GET /api/admin/scholarships — list scholarships
router.get('/', async (req, res) => {
  res.json({ success: true }); // list retrieved by student module
});

// POST /api/admin/scholarships — add new scholarship
router.post('/', async (req, res) => {
  await query.addScholarship(req.body.title.trim(), req.body.description.trim(), req.body.amount.trim());
  res.json({ success: true });
});

module.exports = router;