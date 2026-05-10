const express = require('express');
const router  = express.Router({ mergeParams: true });
const query   = require('../../Database/adminDue');

// GET /api/admin/dues/new — list existing due types
router.get('/', async (req, res) => {
  const dues = await query.selectDue();
  res.json({ dues });
});

// POST /api/admin/dues/new — create new due type
router.post('/', async (req, res) => {
  await query.addDue(req.body.Description, req.body.Amount);
  res.json({ success: true });
});

module.exports = router;