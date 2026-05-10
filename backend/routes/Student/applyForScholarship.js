const express = require('express');
const router  = express.Router({ mergeParams: true });
const query   = require('../../Database/STUDENT/scholarship&dues');
const { PDFDocument, rgb } = require('pdf-lib');
const fs   = require('fs').promises;
const path = require('path');

async function generatePDF(studentInfo) {
  const lineHeight = 25, margin = 50, fontSizeTitle = 20, fontSizeContent = 14;
  const pdfDoc = await PDFDocument.create();
  const pageWidth = 600;
  let pageHeight = margin + fontSizeTitle + Object.keys(studentInfo).length * lineHeight;
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;
  page.drawText('Student Information:', { x: margin, y, size: fontSizeTitle });
  y -= lineHeight;
  for (const [k, v] of Object.entries(studentInfo)) {
    page.drawText(`${k}: ${v}`, { x: margin, y, size: fontSizeContent, color: rgb(0,0,0) });
    y -= lineHeight;
  }
  return pdfDoc.save();
}

// GET /api/student/scholarship
router.get('/', async (req, res) => {
  const status  = await query.getScholarshipStatus(req.user.STUDENT_ID);
  const options = await query.getScholarshipInformaton();
  const applied = status.length > 0;
  const approved = applied && status[0].STATUS === 'approved';
  res.json({ options, applied, approved, status: status[0]?.STATUS || null });
});

// POST /api/student/scholarship
router.post('/', async (req, res) => {
  await query.addStudentScholarshipApplication(req.user.STUDENT_ID, req.body.option);
  const pdfBytes  = await generatePDF(req.user);
  const filePath  = path.join(__dirname, '..', '..', 'docs', 'scholarship', `${req.user.STUDENT_ID}.pdf`);
  await fs.writeFile(filePath, pdfBytes);
  res.json({ success: true });
});

module.exports = router;
