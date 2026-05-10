const express = require('express');
const router  = express.Router({ mergeParams: true });
const path    = require('path');
const query   = require('../../Database/TEACHER/sholarship');

// GET /api/teacher/approve-scholarship
router.get('/', async (req, res) => {
  const scholarships = await query.viewScholarship(req.user.TEACHER_ID);
  res.json({ scholarships });
});

// POST /api/teacher/approve-scholarship
router.post('/', async (req, res) => {
  let scholarship = req.body['selectedItems[]'];
  if (!Array.isArray(scholarship)) scholarship = [scholarship];
  await query.changeScholarshipStatus(scholarship);
  res.json({ success: true });
});

// GET /api/teacher/approve-scholarship/pdf/:studentID — download scholarship PDF
router.get('/pdf/:studentID', (req, res) => {
  const pdfFilePath = path.join(__dirname, '..', '..', 'docs', 'scholarship', `${req.params.studentID}.pdf`);
  res.download(pdfFilePath, `${req.params.studentID}.pdf`, err => {
    if (err) res.status(404).json({ error: 'PDF not found' });
  });
});

module.exports = router;
