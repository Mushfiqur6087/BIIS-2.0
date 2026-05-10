const express = require('express');
const router  = express.Router({ mergeParams: true });

// GET /api/student/results — just confirm the endpoint exists; data fetched via POST
router.get('/', (_req, res) => res.json({ success: true }));

module.exports = router;