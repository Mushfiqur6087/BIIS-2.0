const express = require('express');
const router  = express.Router();

router.post('/', (_req, res) => {
  res.clearCookie('accesstoken');
  res.json({ success: true });
});

module.exports = router;