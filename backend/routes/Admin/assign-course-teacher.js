const express    = require('express');
const router     = express.Router({ mergeParams: true });
const multer     = require('multer');
const csv        = require('csv-parser');
const { Readable } = require('stream');
const query      = require('../../Database/TEACHER/teahesQuery');
const db         = require('../../Database/database');

const upload = multer({ storage: multer.memoryStorage() });

// POST /api/admin/assign-course-teacher — single assignment
router.post('/', async (req, res) => {
  await query.insertTeaches(req.body.teacherID, req.body.courseID);
  if (db.ErrorMsg.showError)
    return res.status(403).json({ error: 'Assignment failed. Check teacher/course exist in same dept.' });
  res.json({ success: true });
});

// POST /api/admin/assign-course-teacher/csv — bulk CSV assignment
router.post('/csv', upload.single('File'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'CSV file required' });
  const results = [];
  const stream  = Readable.from(req.file.buffer.toString('utf8'));
  stream.pipe(csv())
    .on('data', row => results.push(row))
    .on('end', async () => {
      await query.insertTeachesMany(results);
      res.json({ success: true, count: results.length });
    })
    .on('error', err => res.status(500).json({ error: err.message }));
});

module.exports = router;