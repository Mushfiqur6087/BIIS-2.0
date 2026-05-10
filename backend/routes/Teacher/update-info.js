const express = require('express');
const router  = express.Router({ mergeParams: true });
const multer  = require('multer');
const path    = require('path');
const query   = require('../../Database/TEACHER/createUser');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'public', 'img'),
  filename: (_req, file, cb) =>
    cb(null, 'TEACHER-' + file.fieldname + '-' + _req.user.TEACHER_ID + path.extname(file.originalname)),
});
const upload = multer({ storage });

// GET /api/teacher/update-info
router.get('/', (req, res) => {
  res.json({
    phoneNo: req.user.PHONE1, phoneNo2: req.user.PHONE2,
    email: req.user.MAIL, address: req.user.ADDRESS,
  });
});

// POST /api/teacher/update-info
router.post('/', upload.single('File'), async (req, res) => {
  const { Phone1, Phone2, Email, Address } = req.body;
  await query.updateInformation(req.user.TEACHER_ID, Phone1, Phone2, Email, Address);
  res.json({ success: true });
});

module.exports = router;
