const express = require('express');
const router  = express.Router({ mergeParams: true });
router.get('/', (_req, res) => res.json({ success: true }));
module.exports = router;