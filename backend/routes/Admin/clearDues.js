const express  = require('express');
const router   = express.Router({ mergeParams: true });
const multer   = require('multer');
const csv      = require('csv-parser');
const { Readable } = require('stream');
const query    = require('../../Database/adminDue');

const upload = multer({ storage: multer.memoryStorage() });

// GET /api/admin/dues/clear — list due types for the form
router.get('/', async (req, res) => {
  const dues = await query.selectDue();
  res.json({ dues });
});

// POST /api/admin/dues/clear — upload CSV and clear dues
router.post('/', upload.single('File'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'CSV file required' });
  const results = [];
  const stream  = Readable.from(req.file.buffer.toString('utf8'));
  stream.pipe(csv())
    .on('data', row => results.push(row))
    .on('end', async () => {
      await query.updateStudentDue(req.body.option, results);
      res.json({ success: true, count: results.length });
    })
    .on('error', err => res.status(500).json({ error: err.message }));
});

module.exports = router;