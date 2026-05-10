const express = require('express');
const router  = express.Router({ mergeParams: true });
const query   = require('../../Database/STUDENT/course');

// GET /api/admin/registration — current status
router.get('/', async (req, res) => {
  const status = (await query.getRegistrationStatus())[0];
  res.json({ status });
});

// POST /api/admin/registration — toggle status
router.post('/', async (req, res) => {
  await query.changeRegistrationStatus(req.body.action);
  res.json({ success: true });
});

module.exports = router;
