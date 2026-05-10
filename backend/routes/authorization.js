const express = require('express');
const router  = express.Router();
const authController = require('../controllers/loginController');

router.post('/login', authController.handleLogin);

// GET /api/auth/me — return current user info from JWT (already verified by verifyJWT before this,
// but auth routes are public, so we decode manually here)
const jwt = require('jsonwebtoken');
router.get('/me', (req, res) => {
  const token = req.cookies?.accesstoken;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ userID: payload.userID, role: payload.role });
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

module.exports = router;