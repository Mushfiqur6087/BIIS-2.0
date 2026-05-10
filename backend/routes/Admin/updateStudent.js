const express = require('express');
const router  = express.Router({ mergeParams: true });
// updateStudent is now handled by PATCH /api/admin/students/:id — this file is a no-op
// Keeping for backwards compat but routes are empty
module.exports = router;