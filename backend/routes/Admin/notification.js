const express = require('express');
const router  = express.Router({ mergeParams: true });
// Notification page has no data of its own — the real-time feed comes via Socket.IO
router.get('/', (_req, res) => res.json({ success: true }));
module.exports = router;
