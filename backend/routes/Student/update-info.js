const express = require('express');
const router  = express.Router({ mergeParams: true });
const multer  = require('multer');
const path    = require('path');
const query   = require('../../Database/STUDENT/insertStudent');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'public', 'img'),
  filename: (_req, file, cb) =>
    cb(null, 'STUDENT-' + file.fieldname + '-' + _req.user.STUDENT_ID + path.extname(file.originalname)),
});
const upload = multer({ storage });

// GET /api/student/update-info
router.get('/', (req, res) => {
  let dateOfBirth = '';
  try { if (req.user.DATE_OF_BIRTH) dateOfBirth = new Date(req.user.DATE_OF_BIRTH).toISOString().split('T')[0]; } catch (_) {}
  res.json({
    phoneNo: req.user.PHONE_NO, phoneNo2: req.user.PHONE_NO2,
    email: req.user.EMAIL, bankNo: req.user.BANK_ACCOUNT,
    address: req.user.ADDRESS, dateOfBirth, nid: req.user.NID,
  });
});

// POST /api/student/update-info
router.post('/', upload.single('File'), async (req, res) => {
  const { Phone1, Phone2, Email, BankNP, Address, DOB, NID } = req.body;
  await query.updateInformation(req.user.STUDENT_ID, Phone1, Phone2, Email, BankNP, Address, new Date(DOB), NID);
  res.json({ success: true });
});

module.exports = router;
